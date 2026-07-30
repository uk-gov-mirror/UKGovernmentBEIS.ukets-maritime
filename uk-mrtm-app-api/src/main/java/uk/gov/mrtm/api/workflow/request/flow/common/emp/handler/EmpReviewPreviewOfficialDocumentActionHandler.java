package uk.gov.mrtm.api.workflow.request.flow.common.emp.handler;

import java.util.List;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.common.exception.MrtmErrorCode;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestTaskDocumentAsyncGeneratedDataPayload;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.event.EmpReviewDocumentGenerateDto;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileInfoDTO;
import uk.gov.netz.api.workflow.request.core.domain.dto.RequestTaskPreviewFileStatus;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;

@Component
@RequiredArgsConstructor
public class EmpReviewPreviewOfficialDocumentActionHandler implements
        RequestTaskActionHandler<NotifyOperatorForDecisionRequestTaskActionPayload> {

	private final RequestTaskService requestTaskService;
	private final EmpReviewDocumentGenerateService empReviewDocumentGenerateService;
    
    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType,
                                      AppUser appUser, NotifyOperatorForDecisionRequestTaskActionPayload payload) {
        RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);
        RequestTaskDocumentAsyncGeneratedDataPayload requestTaskPayload =
                (RequestTaskDocumentAsyncGeneratedDataPayload) requestTask.getPayload();
        
        if(!requestTaskPayload.canPreviewOfficialDocument()) {
        	throw new BusinessException(MrtmErrorCode.EMP_CANNOT_PREVIEW_OFFICIAL_NOTICE, requestTaskId);
        }
        
		final String asyncJobId = empReviewDocumentGenerateService.generate(EmpReviewDocumentGenerateDto.builder()
				.type(RequestGeneratedFileType.OFFICIAL_NOTICE)
				.requestTaskId(requestTaskId)
				.stage(DocumentTemplateStage.PREVIEW)
				.decisionNotification(payload.getDecisionNotification())
				.build());
		
        
        requestTaskPayload.getPreviewFiles().put(RequestGeneratedFileType.OFFICIAL_NOTICE,
				RequestTaskPreviewFileInfoDTO.builder()
					.asyncJobId(asyncJobId)
					.status(RequestTaskPreviewFileStatus.IN_PROGRESS)
					.build());
        
        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_ISSUANCE_REVIEW_PREVIEW_OFFICIAL_DOCUMENT,
            MrtmRequestTaskActionType.EMP_VARIATION_REVIEW_PREVIEW_OFFICIAL_DOCUMENT,
            MrtmRequestTaskActionType.EMP_VARIATION_SUBMIT_REGULATOR_LED_PREVIEW_OFFICIAL_DOCUMENT);
    }
}
