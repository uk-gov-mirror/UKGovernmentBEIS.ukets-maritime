package uk.gov.mrtm.api.workflow.request.flow.empvariation.service;

import java.util.ArrayList;
import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanQueryService;
import uk.gov.mrtm.api.emissionsmonitoringplan.service.EmissionsMonitoringPlanService;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmDocumentTemplateType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.EmpCreateDocumentService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestInfo;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.mapper.EmpVariationMapper;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

@Service
@RequiredArgsConstructor
public class EmpVariationCreateEmpDocumentService {

	private final RequestTaskService requestTaskService;
	private final EmissionsMonitoringPlanService emissionsMonitoringPlanService;
    private final EmissionsMonitoringPlanQueryService emissionsMonitoringPlanQueryService;
    private final EmpCreateDocumentService empCreateDocumentService;
    private final EmpVariationRequestQueryService empVariationRequestQueryService;
    private final EmpVariationDraftDataQueryService empDraftDataQueryService;
    private final MrtmDocumentTemplateAccountDataCollectFromEmpVariationService templateAccountDataCollectFromEmpVariationService;
    
    private static final EmpVariationMapper EMP_VARIATION_MAPPER = Mappers.getMapper(EmpVariationMapper.class);
    
	public String createAsyncConvert(Long requestTaskId, DocumentTemplateStage stage,
			DecisionNotification decisionNotification) {
    	final RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);
    	final Request request = requestTask.getRequest();
        
        final Long accountId = request.getAccountId();
        
        final String empId = emissionsMonitoringPlanQueryService.getEmpIdByAccountId(accountId)
				.orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        
		final EmissionsMonitoringPlanContainer empContainer = EMP_VARIATION_MAPPER.toEmissionsMonitoringPlanContainer(
				(EmpVariationApplicationSubmitRequestTaskPayload) requestTask.getPayload());
        
		final int nextConsolidationNumber = emissionsMonitoringPlanService
				.calculateNextConsolidationNumber(accountId);
        
        final EmissionsMonitoringPlanDTO empDTO = EmissionsMonitoringPlanDTO.builder()
        		.id(empId)
        		.accountId(accountId)
        		.empContainer(empContainer)
        		.consolidationNumber(nextConsolidationNumber)
        		.build();

		final EmpVariationRequestInfo variationCurrentRequest = empDraftDataQueryService
				.getEmpVariationDraftData(requestTask, nextConsolidationNumber);
        
        final List<EmpVariationRequestInfo> variationHistoricalRequests =
            empVariationRequestQueryService.findEmpVariationRequests(accountId);

        final List<EmpVariationRequestInfo> variationHistory = new ArrayList<>(variationHistoricalRequests);
        variationHistory.add(variationCurrentRequest);

        final Request empIssuanceRequest = emissionsMonitoringPlanQueryService.findApprovedByAccountId(accountId);
        
		final MrtmDocumentTemplateAccountData accountData = templateAccountDataCollectFromEmpVariationService
				.collect(requestTask);

        return empCreateDocumentService.generateDocumentAsyncConvert(request,
        	requestTaskId,
        	decisionNotification.getSignatory(),
            empDTO,
            MrtmDocumentTemplateType.EMP,
            stage,
            variationHistory,
            empIssuanceRequest.getSubmissionDate(),
            empIssuanceRequest.getEndDate(),
            accountData
            );
    }

}
