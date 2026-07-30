package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewDecisionRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewDecisionSubmittedRequestActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewDecisionType;
import uk.gov.netz.api.workflow.request.flow.common.mapper.PeerReviewMapper;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SiteVisitReviewPeerDecisionActionHandler implements
    RequestTaskActionHandler<PeerReviewDecisionRequestTaskActionPayload> {

    private final RequestService requestService;
    private final RequestTaskService requestTaskService;
    private final WorkflowService workflowService;

    private static final PeerReviewMapper peerReviewMapper = Mappers.getMapper(PeerReviewMapper.class);

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser,
                                      PeerReviewDecisionRequestTaskActionPayload taskActionPayload) {
        final RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);
        final Request request = requestTask.getRequest();
        final String peerReviewer = appUser.getUserId();

        final PeerReviewDecisionSubmittedRequestActionPayload actionPayload = peerReviewMapper
                .toPeerReviewDecisionSubmittedRequestActionPayload(taskActionPayload,
                        MrtmRequestActionPayloadType.SITE_VISIT_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD);

        final String type = actionPayload.getDecision().getType() == PeerReviewDecisionType.AGREE ?
                MrtmRequestActionType.SITE_VISIT_APPLICATION_PEER_REVIEWER_ACCEPTED :
                MrtmRequestActionType.SITE_VISIT_APPLICATION_PEER_REVIEWER_REJECTED;

        requestService.addActionToRequest(request, actionPayload, type, peerReviewer);

        workflowService.completeTask(requestTask.getProcessTaskId());

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.SITE_VISIT_REVIEW_SUBMIT_PEER_REVIEW_DECISION);
    }
}
