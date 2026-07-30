package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationAmendsSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitSaveApplicationAmendRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.RequestSiteVisitReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitSaveApplicationAmendActionHandlerTest {

    @InjectMocks
    private SiteVisitSaveApplicationAmendActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;
    @Mock
    private RequestSiteVisitReviewService siteVisitReviewService;

    @Test
    void process() {
        Long requestTaskId = 1L;
        String requestTaskActionType = "requestTaskActionType";
        AppUser appUser = AppUser.builder().build();
        SiteVisitSaveApplicationAmendRequestTaskActionPayload payload = mock(SiteVisitSaveApplicationAmendRequestTaskActionPayload.class);
        SiteVisitApplicationAmendsSubmitRequestTaskPayload requestTaskPayload = SiteVisitApplicationAmendsSubmitRequestTaskPayload.builder().build();
        RequestTask requestTask = RequestTask.builder()
            .payload(requestTaskPayload)
            .build();

        when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);

        RequestTaskPayload actual = handler.process(requestTaskId, requestTaskActionType, appUser, payload);

        assertThat(actual).isEqualTo(requestTaskPayload);
        verify(siteVisitReviewService).saveAmend(payload, requestTask);
        verify(requestTaskService).findTaskById(requestTaskId);

        verifyNoMoreInteractions(siteVisitReviewService, requestTaskService);
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes()).containsOnly(MrtmRequestTaskActionType.SITE_VISIT_SAVE_APPLICATION_AMEND);
    }
}