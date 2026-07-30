package uk.gov.mrtm.api.workflow.request.flow.empreissue.service;

import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.EmpCreateDocumentService;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmDocumentTemplateAccountDataCollectFromAccountService;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.domain.EmpReissueRequestMetadata;
import uk.gov.mrtm.api.workflow.request.flow.empreissue.mapper.EmpReissueRequestMapper;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestInfo;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationRequestQueryService;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.common.utils.DateService;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
class EmpReissueCreateEmpDocumentService {
	
	private final EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;
	private final EmpCreateDocumentService empCreateDocumentService;
	private final EmpVariationRequestQueryService empVariationRequestQueryService;
	private final EmpReissueRequestMapper empReissueRequestMapper = Mappers.getMapper(EmpReissueRequestMapper.class);
	private final DateService dateService;
	private final MrtmDocumentTemplateAccountDataCollectFromAccountService mrtmAccountTemplateDataCollectFromAccountService;

	@Transactional
    public CompletableFuture<FileInfoDTO> create(Request request) {
		final EmpReissueRequestMetadata requestMetadata = (EmpReissueRequestMetadata) request.getMetadata();
		final Long accountId = request.getAccountId();
		
		final List<EmpVariationRequestInfo> variationHistoricalRequests =
			empVariationRequestQueryService.findEmpVariationRequests(accountId);
		final EmpVariationRequestInfo variationCurrentRequest = empReissueRequestMapper
			.toEmpVariationRequestInfo(request, dateService.getLocalDateTime());

		List<EmpVariationRequestInfo> variationHistory = new ArrayList<>(variationHistoricalRequests);
		variationHistory.add(variationCurrentRequest);

		final EmissionsMonitoringPlanDTO emp = emissionsMonitoringPlanQueryService.getEmissionsMonitoringPlanDTOByAccountId(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

		Request empRequest = emissionsMonitoringPlanQueryService.findApprovedByAccountId(accountId);
		
		MrtmDocumentTemplateAccountData accountData = mrtmAccountTemplateDataCollectFromAccountService.collect(accountId);

		return empCreateDocumentService.generateDocumentAsync(request,
				requestMetadata.getSignatory(),
                emp,
				MrtmDocumentTemplateType.EMP,
				variationHistory,
				empRequest.getSubmissionDate(),
				empRequest.getEndDate(),
				accountData
				);
    }
}
