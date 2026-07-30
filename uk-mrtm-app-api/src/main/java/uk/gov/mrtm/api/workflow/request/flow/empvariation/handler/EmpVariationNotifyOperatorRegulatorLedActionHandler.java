package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.event.EmpReviewDocumentGenerateDto;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.handler.EmpReviewDocumentGenerateService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationSubmitRegulatorLedService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.validator.EmpVariationNotifyOperatorRegulatorLedValidator;
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
public class EmpVariationNotifyOperatorRegulatorLedActionHandler
        implements RequestTaskActionHandler<NotifyOperatorForDecisionRequestTaskActionPayload> {

    private final RequestTaskService requestTaskService;
    private final EmpVariationSubmitRegulatorLedService empVariationSubmitRegulatorLedService;
    private final EmpVariationNotifyOperatorRegulatorLedValidator validator;
    
    private final EmpReviewDocumentGenerateService empReviewDocumentGenerateService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType,
                                      AppUser appUser, NotifyOperatorForDecisionRequestTaskActionPayload payload) {
        final RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);

        validator.validate(requestTask, payload, appUser);
        
        DecisionNotification decisionNotification = payload.getDecisionNotification();
        empVariationSubmitRegulatorLedService.saveDecisionNotification(requestTask, decisionNotification, appUser);
        
        final Request request = requestTask.getRequest();
        request.setSubmissionDate(LocalDateTime.now());
        final EmpVariationRequestPayload requestPayload = (EmpVariationRequestPayload) request.getPayload();
        
        //trigger document generation events
        EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload requestTaskPayload =
                  (EmpVariationApplicationSubmitRegulatorLedRequestTaskPayload) requestTask.getPayload();
        requestTaskPayload.setFinalDocumentsGenerationInProgress(true);
        requestTaskPayload.setFinalDocumentsGenerationSuccessful(null);
        
        // generate emp
        if(requestPayload.shouldGenerateEmpDocument()) {
        	empReviewDocumentGenerateService.generate(EmpReviewDocumentGenerateDto.builder()
        			.requestTaskId(requestTask.getId())
        			.type(RequestGeneratedFileType.EMP)
        			.stage(DocumentTemplateStage.FINAL)
        			.decisionNotification(payload.getDecisionNotification())
        			.build());
        }
        
        //generate official notice
		empReviewDocumentGenerateService.generate(EmpReviewDocumentGenerateDto.builder()
				.requestTaskId(requestTask.getId())
				.type(RequestGeneratedFileType.OFFICIAL_NOTICE)
				.stage(DocumentTemplateStage.FINAL)
				.decisionNotification(payload.getDecisionNotification())
				.build());
        
        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_REGULATOR_LED);
    }
}
