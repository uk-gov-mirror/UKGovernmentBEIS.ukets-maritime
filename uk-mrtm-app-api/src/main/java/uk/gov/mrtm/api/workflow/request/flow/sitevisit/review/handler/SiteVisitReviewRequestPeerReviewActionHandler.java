package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.RequestSiteVisitReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SiteVisitReviewRequestPeerReviewActionHandler implements RequestTaskActionHandler<PeerReviewRequestTaskActionPayload> {

    private final RequestTaskService requestTaskService;
    private final RequestService requestService;
    private final WorkflowService workflowService;
    private final RequestSiteVisitReviewService siteVisitReviewService;
    private final SiteVisitValidatorService siteVisitValidatorService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser,
                                      PeerReviewRequestTaskActionPayload actionPayload) {
        final RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);
        final Request request = requestTask.getRequest();
        final SiteVisitApplicationReviewRequestTaskPayload payload =
                (SiteVisitApplicationReviewRequestTaskPayload) requestTask.getPayload();
        final String peerReviewer = actionPayload.getPeerReviewer();

        // Validate
        siteVisitValidatorService.validateReviewDecision(payload.getReviewDecision());
        siteVisitValidatorService.isDecisionAcceptedOrRejected(payload.getReviewDecision());
        siteVisitValidatorService.validatePeerReviewer(requestTask, peerReviewer, appUser);

        // Save as Peer Review
        siteVisitReviewService.saveRequestPeerReviewAction(requestTask, peerReviewer, appUser);
        requestService.addActionToRequest(request, null,
                MrtmRequestActionType.SITE_VISIT_PEER_REVIEW_REQUESTED, appUser.getUserId());

        // Complete task
        workflowService.completeTask(requestTask.getProcessTaskId(),
                Map.of(BpmnProcessConstants.REQUEST_ID, requestTask.getRequest().getId(),
                        BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.PEER_REVIEW_REQUIRED)
        );

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.SITE_VISIT_REQUEST_PEER_REVIEW);
    }
}
