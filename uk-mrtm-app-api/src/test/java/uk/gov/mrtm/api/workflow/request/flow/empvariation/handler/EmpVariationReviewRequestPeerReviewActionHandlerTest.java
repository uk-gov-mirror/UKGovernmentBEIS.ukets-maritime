package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.service.EmpVariationReviewService;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.validator.EmpVariationReviewRequestPeerReviewValidatorService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewRequestTaskActionPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpVariationReviewRequestPeerReviewActionHandlerTest {

	@InjectMocks
    private EmpVariationReviewRequestPeerReviewActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private EmpVariationReviewService empVariationReviewService;

    @Mock
    private RequestService requestService;

    @Mock
    private WorkflowService workflowService;

    @Mock
    private EmpVariationReviewRequestPeerReviewValidatorService requestPeerReviewValidatorService;

    @Test
    void process() {
        Long requestTaskId = 1L;
        String peerReviewer = "peerReviewer";
        String requestTaskActionType = MrtmRequestTaskActionType.EMP_VARIATION_REQUEST_PEER_REVIEW;
        RequestTaskPayload expectedRequestTaskPayload = mock(RequestTaskPayload.class);
        RequestTask requestTask = RequestTask.builder()
            .id(requestTaskId)
            .payload(expectedRequestTaskPayload)
            .request(Request.builder().id("REQ-ID").build())
            .processTaskId("process-task-id")
            .build();
        PeerReviewRequestTaskActionPayload taskActionPayload = PeerReviewRequestTaskActionPayload
        		.builder()
        		.peerReviewer(peerReviewer)
        		.build();
        AppUser appUser = AppUser.builder().userId("userId").build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);

        RequestTaskPayload requestTaskPayload =
            handler.process(requestTaskId, requestTaskActionType, appUser, taskActionPayload);

        assertThat(requestTaskPayload).isEqualTo(expectedRequestTaskPayload);
        verifyNoMoreInteractions(expectedRequestTaskPayload);
        verify(requestPeerReviewValidatorService, times(1)).validate(requestTask,peerReviewer, appUser);
        verify(empVariationReviewService, times(1))
            .saveRequestPeerReviewAction(requestTask,peerReviewer, appUser);
        verify(requestService, times(1))
            .addActionToRequest(requestTask.getRequest(), null,
                    MrtmRequestActionType.EMP_VARIATION_PEER_REVIEW_REQUESTED, appUser.getUserId());
        verify(workflowService, times(1))
            .completeTask(requestTask.getProcessTaskId(), Map.of(
                BpmnProcessConstants.REQUEST_ID, requestTask.getRequest().getId(),
                BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.PEER_REVIEW_REQUIRED));
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes()).containsExactly(MrtmRequestTaskActionType.EMP_VARIATION_REQUEST_PEER_REVIEW);
    }
}
