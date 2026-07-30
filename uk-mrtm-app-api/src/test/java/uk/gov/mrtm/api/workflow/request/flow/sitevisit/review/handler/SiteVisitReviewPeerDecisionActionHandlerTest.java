package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionPayloadTypes;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain.NonComplianceCivilPenaltyRequestTaskPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewDecision;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewDecisionRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewDecisionSubmittedRequestActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.PeerReviewDecisionType;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitReviewPeerDecisionActionHandlerTest {

    @InjectMocks
    private SiteVisitReviewPeerDecisionActionHandler handler;

    @Mock
    private RequestService requestService;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private WorkflowService workflowService;

    @ParameterizedTest
    @MethodSource("processScenarios")
    void process(PeerReviewDecisionType type, String requestActionType) {
        final PeerReviewDecision decision = PeerReviewDecision.builder()
            .type(type)
            .notes("i agree")
            .build();
        final PeerReviewDecisionRequestTaskActionPayload payload =
            PeerReviewDecisionRequestTaskActionPayload.builder()
                .payloadType(MrtmRequestTaskActionPayloadTypes.SITE_VISIT_REVIEW_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD)
                .decision(decision)
                .build();
        final String userId = "userId";
        final AppUser appUser = AppUser.builder().userId(userId).build();
        final String processTaskId = "processTaskId";
        final Request request = Request.builder().id("1").build();
        final RequestTask requestTask = RequestTask.builder()
            .id(2L)
            .request(request)
            .payload(NonComplianceCivilPenaltyRequestTaskPayload.builder().build())
            .processTaskId(processTaskId).build();
        final NonComplianceCivilPenaltyRequestTaskPayload expectedRequestTaskPayload =
            NonComplianceCivilPenaltyRequestTaskPayload.builder().build();


        when(requestTaskService.findTaskById(2L)).thenReturn(requestTask);

        RequestTaskPayload actualRequestTaskPayload = handler.process(requestTask.getId(),
            MrtmRequestTaskActionType.SITE_VISIT_REVIEW_SUBMIT_PEER_REVIEW_DECISION,
            appUser,
            payload);

        assertEquals(expectedRequestTaskPayload, actualRequestTaskPayload);

        ArgumentCaptor<PeerReviewDecisionSubmittedRequestActionPayload> actionPayloadArgumentCaptor =
            ArgumentCaptor.forClass(PeerReviewDecisionSubmittedRequestActionPayload.class);

        verify(requestService, times(1)).addActionToRequest(
            eq(request),
            actionPayloadArgumentCaptor.capture(),
            eq(requestActionType),
            eq(userId));

        final PeerReviewDecisionSubmittedRequestActionPayload captorValue = actionPayloadArgumentCaptor.getValue();
        assertThat(captorValue.getDecision()).isEqualTo(decision);
        assertThat(captorValue.getPayloadType()).isEqualTo(MrtmRequestActionPayloadType.SITE_VISIT_PEER_REVIEW_DECISION_SUBMITTED_PAYLOAD);

        verify(workflowService, times(1)).completeTask(processTaskId);
    }

    public static Stream<Arguments> processScenarios() {
        return Stream.of(
            Arguments.of(PeerReviewDecisionType.AGREE, MrtmRequestActionType.SITE_VISIT_APPLICATION_PEER_REVIEWER_ACCEPTED),
            Arguments.of(PeerReviewDecisionType.DISAGREE, MrtmRequestActionType.SITE_VISIT_APPLICATION_PEER_REVIEWER_REJECTED)
        );
    }

    @Test
    void getRequestTaskTypes() {
        assertThat(handler.getTypes()).containsExactly(MrtmRequestTaskActionType.SITE_VISIT_REVIEW_SUBMIT_PEER_REVIEW_DECISION);
    }
}
