package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.domain.RequestGeneratedFileType;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.event.EmpReviewDocumentGenerateDto;
import uk.gov.mrtm.api.workflow.request.flow.common.emp.handler.EmpReviewDocumentGenerateService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service.RequestEmpReviewService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.validation.EmpIssuanceReviewNotifyOperatorValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.documenttemplate.domain.DocumentTemplateStage;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EmpIssuanceReviewNotifyOperatorActionHandler
        implements RequestTaskActionHandler<NotifyOperatorForDecisionRequestTaskActionPayload> {

    private final RequestTaskService requestTaskService;
    private final RequestEmpReviewService requestEmpReviewService;
    private final EmpIssuanceReviewNotifyOperatorValidatorService reviewNotifyOperatorValidatorService;
    private final EmpReviewDocumentGenerateService empReviewDocumentGenerateService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser,
                                      NotifyOperatorForDecisionRequestTaskActionPayload payload) {
        RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);

        reviewNotifyOperatorValidatorService.validate(requestTask, payload, appUser);

        DecisionNotification decisionNotification = payload.getDecisionNotification();
        requestEmpReviewService.saveDecisionNotification(requestTask, decisionNotification, appUser);

        //trigger document generation events
        EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload =
            (EmpIssuanceApplicationReviewRequestTaskPayload) requestTask.getPayload();
        requestTaskPayload.setFinalDocumentsGenerationInProgress(true);
        requestTaskPayload.setFinalDocumentsGenerationSuccessful(null);

        final Request request = requestTask.getRequest();
        final EmpIssuanceRequestPayload requestPayload = (EmpIssuanceRequestPayload) request.getPayload();

        // generate emp
        if(requestPayload.shouldGenerateEmpDocument()) {
            empReviewDocumentGenerateService.generate(EmpReviewDocumentGenerateDto.builder()
                .requestTaskId(requestTask.getId())
                .type(RequestGeneratedFileType.EMP)
                .stage(DocumentTemplateStage.FINAL)
                .decisionNotification(decisionNotification)
                .build());
        }

        //generate official notice
        empReviewDocumentGenerateService.generate(EmpReviewDocumentGenerateDto.builder()
            .requestTaskId(requestTask.getId())
            .type(RequestGeneratedFileType.OFFICIAL_NOTICE)
            .stage(DocumentTemplateStage.FINAL)
            .decisionNotification(decisionNotification)
            .build());

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_ISSUANCE_NOTIFY_OPERATOR_FOR_DECISION);
    }
}
