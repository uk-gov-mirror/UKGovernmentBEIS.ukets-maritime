package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import java.util.List;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.event.EmpReviewDocumentGenerateDto;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.handler.EmpReviewDocumentGenerateService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewNotifyOperatorValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;

@Component
@RequiredArgsConstructor
public class EmpVariationReviewNotifyOperatorActionHandler implements
        RequestTaskActionHandler<NotifyOperatorForDecisionRequestTaskActionPayload> {

	private final RequestTaskService requestTaskService;
    private final EmpVariationReviewService empVariationReviewService;
    private final EmpVariationReviewNotifyOperatorValidatorService reviewNotifyOperatorValidatorService;
    private final EmpReviewDocumentGenerateService empReviewDocumentGenerateService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType,
                                      AppUser appUser, NotifyOperatorForDecisionRequestTaskActionPayload payload) {
        RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);

        reviewNotifyOperatorValidatorService.validate(requestTask, payload, appUser);

        DecisionNotification decisionNotification = payload.getDecisionNotification();
        empVariationReviewService.saveDecisionNotification(requestTask, decisionNotification, appUser);
        
        //trigger document generation events
        EmpVariationApplicationReviewRequestTaskPayload requestTaskPayload =
                  (EmpVariationApplicationReviewRequestTaskPayload) requestTask.getPayload();
        requestTaskPayload.setFinalDocumentsGenerationInProgress(true);
        requestTaskPayload.setFinalDocumentsGenerationSuccessful(null);
        
        final Request request = requestTask.getRequest();
        final EmpVariationRequestPayload requestPayload = (EmpVariationRequestPayload) request.getPayload();
        
        // generate emp
        if(requestPayload.shouldGenerateEmpDocument()) {
        	empReviewDocumentGenerateService.generate(
        			EmpReviewDocumentGenerateDto.builder()
        			.requestTaskId(requestTask.getId())
        			.type(RequestGeneratedFileType.EMP)
        			.stage(DocumentTemplateStage.FINAL)
        			.decisionNotification(decisionNotification)
        			.build()
        			);
        }
        
        //generate official notice
        empReviewDocumentGenerateService.generate(
        		EmpReviewDocumentGenerateDto.builder()
				.requestTaskId(requestTask.getId())
				.type(RequestGeneratedFileType.OFFICIAL_NOTICE)
				.stage(DocumentTemplateStage.FINAL)
				.decisionNotification(decisionNotification)
				.build()
        		);
        
        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION);
    }
}
