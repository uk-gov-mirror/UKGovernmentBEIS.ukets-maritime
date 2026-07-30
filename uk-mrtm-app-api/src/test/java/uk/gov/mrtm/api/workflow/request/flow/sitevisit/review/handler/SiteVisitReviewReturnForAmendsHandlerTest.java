package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.submit.domain.EmpIssuanceRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.RequestSiteVisitReviewService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform.SiteVisitReviewMapper;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.domain.constants.RequestTaskActionPayloadTypes;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitReviewReturnForAmendsHandlerTest {

    @InjectMocks
    private SiteVisitReviewReturnForAmendsHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private RequestService requestService;

    @Mock
    private RequestSiteVisitReviewService service;

    @Mock
    private SiteVisitValidatorService validatorService;

    @Mock
    private WorkflowService workflowService;

    @Mock
    private SiteVisitReviewMapper mapper;

    @Test
    void doProcess() {
        long taskId = 1L;
        RequestTaskActionEmptyPayload emptyPayload = RequestTaskActionEmptyPayload.builder().payloadType(RequestTaskActionPayloadTypes.EMPTY_PAYLOAD).build();
        String userId = "userId";
        AppUser appUser = AppUser.builder().userId(userId).build();

        String processTaskId = "processTaskId";

        SiteVisitReviewDecision reviewDecision = mock(SiteVisitReviewDecision.class);
        SiteVisitApplicationReviewRequestTaskPayload payload = SiteVisitApplicationReviewRequestTaskPayload.builder()
            .reviewDecision(reviewDecision)
            .build();

        Request request = Request.builder()
            .id("2")
            .payload(EmpIssuanceRequestPayload.builder().build())
            .build();
        RequestTask requestTask = RequestTask.builder()
            .id(taskId)
            .processTaskId(processTaskId)
            .payload(payload)
            .request(request)
            .build();

        SiteVisitApplicationReturnedForAmendsRequestActionPayload actionPayload =
            mock(SiteVisitApplicationReturnedForAmendsRequestActionPayload.class);

        Request newRequest = Request.builder()
            .id("2")
            .build();

        when(requestTaskService.findTaskById(taskId)).thenReturn(requestTask);
        when(mapper.toSiteVisitApplicationReturnedForAmendsRequestActionPayload(payload,
            MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD)).thenReturn(actionPayload);

        // Invoke
        RequestTaskPayload requestTaskPayload = handler.process(taskId,
            MrtmRequestTaskActionType.SITE_VISIT_REVIEW_RETURN_FOR_AMENDS, appUser, emptyPayload);

        // Verify
        assertThat(requestTaskPayload).isEqualTo(payload);
        verify(requestTaskService).findTaskById(taskId);
        verify(validatorService).validateReviewDecision(reviewDecision);
        verify(validatorService).validateSendForAmends(payload);
        verify(service).saveRequestReturnForAmends(requestTask, appUser);
        verify(mapper).toSiteVisitApplicationReturnedForAmendsRequestActionPayload(payload,
            MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD);
        verify(requestService)
            .addActionToRequest(newRequest, actionPayload, MrtmRequestActionType.SITE_VISIT_APPLICATION_RETURNED_FOR_AMENDS, userId);
        verify(workflowService)
            .completeTask(processTaskId, Map.of(BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.AMENDS_NEEDED));
        verifyNoMoreInteractions(requestTaskService, requestService, service, workflowService, validatorService, mapper);
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes())
            .containsExactlyElementsOf(List.of(MrtmRequestTaskActionType.SITE_VISIT_REVIEW_RETURN_FOR_AMENDS));
    }
}
