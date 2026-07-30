package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationAmendsSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationAmendsSubmittedRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.RequestSiteVisitReviewService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform.SiteVisitReviewMapper;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.transform.SiteVisitSubmitMapper;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitSubmitApplicationAmendActionHandlerTest {

    @InjectMocks
    private SiteVisitSubmitApplicationAmendActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;
    @Mock
    private RequestService requestService;
    @Mock
    private RequestSiteVisitReviewService requestSiteVisitReviewService;
    @Mock
    private WorkflowService workflowService;
    @Mock
    private SiteVisitValidatorService validatorService;
    @Mock
    private SiteVisitReviewMapper siteVisitReviewMapper;
    @Mock
    private SiteVisitSubmitMapper siteVisitSubmitMapper;

    @Test
    void process() {
        Long requestTaskId = 1L;
        String requestTaskActionType = "requestTaskActionType";
        String processTaskId = "processTaskId";
        AppUser appUser = AppUser.builder().build();
        SiteVisitContainer siteVisitContainer = mock(SiteVisitContainer.class);
        RequestTaskActionEmptyPayload payload = mock(RequestTaskActionEmptyPayload.class);
        SiteVisitApplicationAmendsSubmitRequestTaskPayload requestTaskPayload = SiteVisitApplicationAmendsSubmitRequestTaskPayload.builder().build();
        Request request = mock(Request.class);
        SiteVisitApplicationAmendsSubmittedRequestActionPayload actionPayload = mock(SiteVisitApplicationAmendsSubmittedRequestActionPayload.class);
        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .processTaskId(processTaskId)
            .request(request)
            .build();

        when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);
        when(siteVisitSubmitMapper.toSiteVisitContainer(requestTaskPayload)).thenReturn(siteVisitContainer);
        when(siteVisitReviewMapper.toSiteVisitApplicationAmendsSubmittedRequestActionPayload(requestTaskPayload,
            MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_AMENDS_SUBMITTED_PAYLOAD)).thenReturn(actionPayload);

        RequestTaskPayload actual = handler.process(requestTaskId, requestTaskActionType, appUser, payload);

        assertThat(actual).isEqualTo(requestTaskPayload);
        verify(requestTaskService).findTaskById(requestTaskId);
        verify(requestService).addActionToRequest(request,
            actionPayload,
            MrtmRequestActionType.SITE_VISIT_APPLICATION_AMENDS_SUBMITTED,
            appUser.getUserId());
        verify(requestSiteVisitReviewService).submitAmend(requestTask);
        verify(siteVisitSubmitMapper).toSiteVisitContainer(requestTaskPayload);
        verify(siteVisitReviewMapper).toSiteVisitApplicationAmendsSubmittedRequestActionPayload(requestTaskPayload,
            MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_AMENDS_SUBMITTED_PAYLOAD);
        verify(validatorService).validateSiteVisit(siteVisitContainer);
        verify(requestTaskService).findTaskById(requestTaskId);
        verify(workflowService).completeTask(processTaskId);

        verifyNoMoreInteractions(requestTaskService, requestService, requestSiteVisitReviewService, workflowService,
            validatorService, siteVisitReviewMapper, siteVisitSubmitMapper);
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes()).containsOnly(MrtmRequestTaskActionType.SITE_VISIT_SUBMIT_APPLICATION_AMEND);
    }
}