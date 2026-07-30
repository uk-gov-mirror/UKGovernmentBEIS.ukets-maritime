package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.RequestSiteVisitReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskType;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitReviewRequestPeerReviewActionHandlerTest {

    @InjectMocks
    private SiteVisitReviewRequestPeerReviewActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private RequestService requestService;

    @Mock
    private WorkflowService workflowService;

    @Mock
    private RequestSiteVisitReviewService requestSiteVisitReviewService;

    @Mock
    private SiteVisitValidatorService siteVisitValidatorService;

    @Test
    void process() {
        Long requestTaskId = 1L;
        AppUser appUser = AppUser.builder().userId("userId").build();
        String selectedPeerReviewer = "selectedPeerReviewer";
        SiteVisitApplicationReviewRequestTaskPayload expectedRequestTaskPayload =
            mock(SiteVisitApplicationReviewRequestTaskPayload.class);
        SiteVisitReviewDecision decision = mock(SiteVisitReviewDecision.class);
        when(expectedRequestTaskPayload.getReviewDecision()).thenReturn(decision);

        PeerReviewRequestTaskActionPayload taskActionPayload = PeerReviewRequestTaskActionPayload.builder()
            .peerReviewer(selectedPeerReviewer)
            .build();
        RequestTask requestTask = RequestTask.builder()
            .id(requestTaskId)
            .request(Request.builder().id("2").build())
            .type(RequestTaskType.builder().code(MrtmRequestTaskType.SITE_VISIT_APPLICATION_REVIEW).build())
            .payload(expectedRequestTaskPayload)
            .processTaskId("processTaskId")
            .build();

        when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);

        // Invoke
        RequestTaskPayload requestTaskPayload = handler.process(requestTaskId,
            MrtmRequestTaskActionType.SITE_VISIT_REQUEST_PEER_REVIEW, appUser, taskActionPayload);

        // Verify
        assertThat(requestTaskPayload).isEqualTo(expectedRequestTaskPayload);
        verify(requestTaskService).findTaskById(requestTaskId);
        verify(siteVisitValidatorService).validateReviewDecision(decision);
        verify(siteVisitValidatorService)
            .validatePeerReviewer(requestTask, selectedPeerReviewer, appUser);
        verify(siteVisitValidatorService).isDecisionAcceptedOrRejected(decision);
        verify(requestSiteVisitReviewService).saveRequestPeerReviewAction(requestTask, selectedPeerReviewer, appUser);
        verify(requestService)
            .addActionToRequest(requestTask.getRequest(), null, MrtmRequestActionType.SITE_VISIT_PEER_REVIEW_REQUESTED, appUser.getUserId());
        verify(workflowService).completeTask(
            requestTask.getProcessTaskId(),
            Map.of(BpmnProcessConstants.REQUEST_ID, requestTask.getRequest().getId(),
                BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.PEER_REVIEW_REQUIRED));

        verifyNoMoreInteractions(requestTaskService, requestService, workflowService,
            requestSiteVisitReviewService, siteVisitValidatorService);
    }

    @Test
    void getType() {
        assertThat(handler.getTypes()).isEqualTo(List.of(MrtmRequestTaskActionType.SITE_VISIT_REQUEST_PEER_REVIEW));
    }
}