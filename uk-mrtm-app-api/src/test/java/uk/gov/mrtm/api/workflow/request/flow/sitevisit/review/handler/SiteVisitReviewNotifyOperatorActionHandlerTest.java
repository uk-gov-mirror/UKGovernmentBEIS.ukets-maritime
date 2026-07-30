package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitDeterminationType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.RequestSiteVisitReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitReviewNotifyOperatorActionHandlerTest {

    @InjectMocks
    private SiteVisitReviewNotifyOperatorActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;
    @Mock
    private WorkflowService workflowService;
    @Mock
    private SiteVisitValidatorService validatorService;
    @Mock
    private RequestSiteVisitReviewService siteVisitReviewService;

    @ParameterizedTest
    @MethodSource
    void process(SiteVisitDeterminationType determinationType, SiteVisitReviewDecisionType reviewDecisionType) {
        Long requestTaskId = 1L;
        String requestTaskActionType = "requestTaskActionType";
        String processTaskId = "processTaskId";
        AppUser appUser = AppUser.builder().build();
        SiteVisitReviewDecision siteVisitReviewDecision = SiteVisitReviewDecision.builder().type(reviewDecisionType).build();
        DecisionNotification decisionNotification = mock(DecisionNotification.class);
        SiteVisitApplicationReviewRequestTaskPayload requestTaskPayload = SiteVisitApplicationReviewRequestTaskPayload.builder()
            .reviewDecision(siteVisitReviewDecision)
            .build();
        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .processTaskId(processTaskId)
            .build();
        NotifyOperatorForDecisionRequestTaskActionPayload taskActionPayload = NotifyOperatorForDecisionRequestTaskActionPayload.builder()
            .decisionNotification(decisionNotification)
            .build();

        when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);

        RequestTaskPayload actual = handler.process(requestTaskId, requestTaskActionType, appUser, taskActionPayload);

        assertThat(actual).isEqualTo(requestTaskPayload);

        verify(siteVisitReviewService).submit(requestTask, taskActionPayload, appUser);
        verify(validatorService).validateReviewDecision(siteVisitReviewDecision);
        verify(validatorService).isDecisionAcceptedOrRejected(siteVisitReviewDecision);
        verify(validatorService).validateNotifyUsers(requestTask, decisionNotification, appUser);
        verify(workflowService).completeTask(processTaskId,
            Map.of(BpmnProcessConstants.REVIEW_DETERMINATION, determinationType,
                BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.NOTIFY_OPERATOR
            ));

        verifyNoMoreInteractions(requestTaskService, workflowService, validatorService, siteVisitReviewService);
    }


    public static Stream<Arguments> process() {
        return Stream.of(
            Arguments.of(SiteVisitDeterminationType.APPROVED, SiteVisitReviewDecisionType.ACCEPTED),
            Arguments.of(SiteVisitDeterminationType.REJECTED, SiteVisitReviewDecisionType.REJECTED)
        );
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes()).containsAnyElementsOf(List.of(MrtmRequestTaskActionType.SITE_VISIT_NOTIFY_OPERATOR_FOR_DECISION));
    }
}