package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.constants.MrtmBpmnProcessConstants;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSubmitOutcome;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationRegulatorLedPeerReviewService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.validator.EmpVariationRequestPeerReviewRegulatorLedValidator;
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
public class EmpVariationRequestPeerReviewRegulatorLedActionHandler implements RequestTaskActionHandler<PeerReviewRequestTaskActionPayload> {

    private final RequestTaskService requestTaskService;
    private final EmpVariationRegulatorLedPeerReviewService empVariationRegulatorLedPeerReviewService;
    private final RequestService requestService;
    private final WorkflowService workflowService;
    private final EmpVariationRequestPeerReviewRegulatorLedValidator validator;
    
    @Override
    public RequestTaskPayload process(final Long requestTaskId,
                                      final String requestTaskActionType,
                                      final AppUser appUser,
                                      final PeerReviewRequestTaskActionPayload taskActionPayload) {
        final RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);
        final Request request = requestTask.getRequest();
        final String userId = appUser.getUserId();
        final String peerReviewer = taskActionPayload.getPeerReviewer();

        validator.validate(requestTask, taskActionPayload, appUser);
        empVariationRegulatorLedPeerReviewService.saveRequestPeerReviewAction(requestTask, peerReviewer, userId);
        requestService.addActionToRequest(request, null, MrtmRequestActionType.EMP_VARIATION_PEER_REVIEW_REQUESTED, userId);
        
        workflowService.completeTask(requestTask.getProcessTaskId(), Map.of(
                BpmnProcessConstants.REQUEST_ID, request.getId(),
                MrtmBpmnProcessConstants.EMP_VARIATION_SUBMIT_OUTCOME, EmpVariationSubmitOutcome.SUBMITTED,
                BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.PEER_REVIEW_REQUIRED
            )
        );
        
        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_VARIATION_REQUEST_PEER_REVIEW_REGULATOR_LED);
    }
}
