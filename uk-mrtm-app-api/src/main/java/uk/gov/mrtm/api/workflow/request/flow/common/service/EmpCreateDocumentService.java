package uk.gov.mrtm.api.workflow.request.flow.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.EmissionsMonitoringPlanContainer;
import uk.gov.mrtm.api.emissionsmonitoringplan.domain.dto.EmissionsMonitoringPlanDTO;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.DocumentTemplateEmpParamsSourceData;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestInfo;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.documenttemplate.domain.templateparams.TemplateParams;
import uk.gov.netz.api.documenttemplate.service.FileDocumentGenerateServiceDelegator;
import uk.gov.netz.api.files.common.domain.dto.FileDTO;
import uk.gov.netz.api.files.common.domain.dto.FileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.flow.common.service.notification.DocumentTemplateGeneratorParamConstants;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class EmpCreateDocumentService {

    private final FileDocumentGenerateServiceDelegator fileDocumentGenerateServiceDelegator;
    private final DocumentTemplateEmpParamsProvider documentTemplateEmpParamsProvider;

    public FileDTO generateDocumentWithParams(final EmissionsMonitoringPlanDTO empDto,
                                              final String type,
                                              final TemplateParams empParams) {

        final String fileName = constructFileName(empDto);
        return fileDocumentGenerateServiceDelegator.generateFileDocument(type, empParams, fileName);
    }
    
    @Deprecated
	public CompletableFuture<FileInfoDTO> generateDocumentAsync(final Request request, 
			final String signatory,
			final EmissionsMonitoringPlanDTO empDto, 
			final String documentTemplateType,
			final List<EmpVariationRequestInfo> empVariationRequestInfo, 
			final LocalDateTime empSubmissionDate,
			final LocalDateTime empEndDate, 
			final MrtmDocumentTemplateAccountData accountData) {
        final EmissionsMonitoringPlanContainer empContainer = empDto.getEmpContainer();
        final TemplateParams empParams = documentTemplateEmpParamsProvider.constructTemplateParams(
                DocumentTemplateEmpParamsSourceData.builder()
                .request(request)
                .signatory(signatory)
                .empContainer(empContainer)
                .variationRequestInfoList(empVariationRequestInfo)
                .consolidationNumber(empDto.getConsolidationNumber())
                .empSubmissionDate(empSubmissionDate)
                .empEndDate(empEndDate)
                .accountData(accountData)
                .build());

        final String fileName = constructFileName(empDto);
        return fileDocumentGenerateServiceDelegator.generateAndSaveFileDocumentAsync(
                documentTemplateType,
                empParams,
                fileName
        );
    }
    
    //TODO reduce number of arguments
	public String generateDocumentAsyncConvert(final Request request,
			final Long requestTaskId,
			final String signatory,
			final EmissionsMonitoringPlanDTO empDto, 
			final String documentTemplateType,
			final DocumentTemplateStage stage,
			final List<EmpVariationRequestInfo> empVariationRequestInfo, 
			final LocalDateTime empSubmissionDate,
			final LocalDateTime empEndDate, 
			final MrtmDocumentTemplateAccountData accountData) {
		final EmissionsMonitoringPlanContainer empContainer = empDto.getEmpContainer();
		final TemplateParams empParams = documentTemplateEmpParamsProvider.constructTemplateParams(
                DocumentTemplateEmpParamsSourceData.builder()
                .request(request)
                .signatory(signatory)
                .empContainer(empContainer)
                .variationRequestInfoList(empVariationRequestInfo)
                .consolidationNumber(empDto.getConsolidationNumber())
                .empSubmissionDate(empSubmissionDate)
                .empEndDate(empEndDate)
                .accountData(accountData)
                .build());

		final Map<String, String> documentMetadata = Map.of(
				DocumentTemplateGeneratorParamConstants.REQUEST_TASK_ID, requestTaskId.toString(),
				DocumentTemplateGeneratorParamConstants.FILE_TYPE, RequestGeneratedFileType.EMP.name(),
				DocumentTemplateGeneratorParamConstants.FILE_NAME, constructFileName(empDto, stage),
				DocumentTemplateGeneratorParamConstants.DOCUMENT_TEMPLATE_STAGE, stage.name()
				); 
		
		return fileDocumentGenerateServiceDelegator.generateDocumentAsyncConvert(documentTemplateType,
				empParams, documentMetadata);
	}

    private String constructFileName(final EmissionsMonitoringPlanDTO empDto) {
        return empDto.getId() + " v" + empDto.getConsolidationNumber() + ".pdf";
    }

    private String constructFileName(final EmissionsMonitoringPlanDTO empDto, final DocumentTemplateStage stage) {
        if (stage == DocumentTemplateStage.PREVIEW) {
            return "emissions_monitoring_plan_preview.pdf";
        }
        return constructFileName(empDto);
    }
}
