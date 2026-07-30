package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.RequestSiteVisitReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SiteVisitReviewNotifyOperatorActionHandler
        implements RequestTaskActionHandler<NotifyOperatorForDecisionRequestTaskActionPayload> {

    private final RequestTaskService requestTaskService;
    private final WorkflowService workflowService;
    private final SiteVisitValidatorService validatorService;
    private final RequestSiteVisitReviewService siteVisitReviewService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser,
                                      NotifyOperatorForDecisionRequestTaskActionPayload taskActionPayload) {

        final RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);

        final SiteVisitApplicationReviewRequestTaskPayload reviewTaskPayload =
            (SiteVisitApplicationReviewRequestTaskPayload) requestTask.getPayload();

        // Validate
        validatorService.validateReviewDecision(reviewTaskPayload.getReviewDecision());
        validatorService.isDecisionAcceptedOrRejected(reviewTaskPayload.getReviewDecision());
        validatorService.validateNotifyUsers(requestTask, taskActionPayload.getDecisionNotification(), appUser);

        // Save payload to request
        siteVisitReviewService.submit(requestTask, taskActionPayload, appUser);

        // Get determination type
        SiteVisitDeterminationType type =
            reviewTaskPayload.getReviewDecision().getType().equals(SiteVisitReviewDecisionType.ACCEPTED)
                ? SiteVisitDeterminationType.APPROVED : SiteVisitDeterminationType.REJECTED;

        // Complete task
        workflowService.completeTask(requestTask.getProcessTaskId(),
            Map.of(BpmnProcessConstants.REVIEW_DETERMINATION, type,
                BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.NOTIFY_OPERATOR
            ));

        return requestTask.getPayload();
    }
    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.SITE_VISIT_NOTIFY_OPERATOR_FOR_DECISION);
    }
}
