package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpVariationRequestPeerReviewRegulatorLedActionHandlerTest {

	@InjectMocks
    private EmpVariationRequestPeerReviewRegulatorLedActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private EmpVariationRegulatorLedPeerReviewService empVariationRegulatorLedPeerReviewService;

    @Mock
    private RequestService requestService;

    @Mock
    private WorkflowService workflowService;

    @Mock
    private EmpVariationRequestPeerReviewRegulatorLedValidator validator;

    @Test
    void process() {
        Long requestTaskId = 1L;
        String peerReviewer = "peerReviewer";
        String requestTaskActionType = MrtmRequestTaskActionType.EMP_VARIATION_REQUEST_PEER_REVIEW_REGULATOR_LED;
        RequestTask requestTask = RequestTask.builder()
            .id(requestTaskId)
            .request(Request.builder().id("REQ-ID").build())
            .processTaskId("process-task-id")
            .build();
        PeerReviewRequestTaskActionPayload taskActionPayload = PeerReviewRequestTaskActionPayload
        		.builder()
        		.peerReviewer(peerReviewer)
        		.build();
        AppUser appUser = AppUser.builder().userId("userId").build();

        when(requestTaskService.findTaskByIdForUpdate(requestTaskId)).thenReturn(requestTask);

        handler.process(requestTaskId, requestTaskActionType, appUser, taskActionPayload);

        verify(validator, times(1)).validate(requestTask, taskActionPayload, appUser);
        verify(empVariationRegulatorLedPeerReviewService, times(1))
            .saveRequestPeerReviewAction(requestTask, peerReviewer, appUser.getUserId());
        verify(requestService, times(1))
            .addActionToRequest(requestTask.getRequest(), null,
                    MrtmRequestActionType.EMP_VARIATION_PEER_REVIEW_REQUESTED, appUser.getUserId());
        verify(workflowService, times(1))
            .completeTask(requestTask.getProcessTaskId(), Map.of(
                BpmnProcessConstants.REQUEST_ID, requestTask.getRequest().getId(),
                MrtmBpmnProcessConstants.EMP_VARIATION_SUBMIT_OUTCOME, EmpVariationSubmitOutcome.SUBMITTED,
                BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.PEER_REVIEW_REQUIRED));
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes()).containsExactly(MrtmRequestTaskActionType.EMP_VARIATION_REQUEST_PEER_REVIEW_REGULATOR_LED);
    }
}
