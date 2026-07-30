package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.validator.EmpVariationReviewRequestPeerReviewValidatorService;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewRequestTaskActionPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmpVariationReviewRequestPeerReviewActionHandler
	implements RequestTaskActionHandler<PeerReviewRequestTaskActionPayload> {
	
	private final RequestTaskService requestTaskService;
    private final EmpVariationReviewService empVariationReviewService;
    private final RequestService requestService;
    private final WorkflowService workflowService;
    private final EmpVariationReviewRequestPeerReviewValidatorService requestPeerReviewValidatorService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser, PeerReviewRequestTaskActionPayload payload) {
        RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);
        String selectedPeerReviewer = payload.getPeerReviewer();

        requestPeerReviewValidatorService.validate(requestTask, selectedPeerReviewer, appUser);
        empVariationReviewService.saveRequestPeerReviewAction(requestTask, selectedPeerReviewer, appUser);
        requestService.addActionToRequest(
            requestTask.getRequest(),
            null,
            MrtmRequestActionType.EMP_VARIATION_PEER_REVIEW_REQUESTED,
                appUser.getUserId()
        );

        workflowService.completeTask(
            requestTask.getProcessTaskId(),
            Map.of(BpmnProcessConstants.REQUEST_ID, requestTask.getRequest().getId(),
                BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.PEER_REVIEW_REQUIRED)
        );

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_VARIATION_REQUEST_PEER_REVIEW);
    }
}
