package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitReviewRequestRecallActionHandlerTest {

    @InjectMocks
    private SiteVisitReviewRequestRecallActionHandler recallActionHandler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private RequestService requestService;

    @Mock
    private WorkflowService workflowService;

    @Test
    void getTypes() {
        assertThat(recallActionHandler.getTypes()).containsExactly(MrtmRequestTaskActionType.SITE_VISIT_RECALL_FROM_AMENDS);
    }

    @Test
    void getRequestActionType() {
        assertEquals(MrtmRequestActionType.SITE_VISIT_RECALLED_FROM_AMENDS, recallActionHandler.getRequestActionType());
    }

    @Test
    void process() {
        AppUser appUser = AppUser.builder().userId("userId").build();
        String processTaskId = "processTaskId";
        Request request = Request.builder().id("requestId").payload(SiteVisitRequestPayload.builder().build()).build();
        RequestTask requestTask = RequestTask.builder()
            .id(1L)
            .processTaskId(processTaskId)
            .request(request)
            .build();

        when(requestTaskService.findTaskById(1L)).thenReturn(requestTask);

        recallActionHandler.process(requestTask.getId(),
            MrtmRequestTaskActionType.SITE_VISIT_RECALL_FROM_AMENDS,
            appUser,
            RequestTaskActionEmptyPayload.builder().build());

        verify(requestTaskService, times(1)).findTaskById(requestTask.getId());
        verify(requestService, times(1)).addActionToRequest(request,
            null,
            MrtmRequestActionType.SITE_VISIT_RECALLED_FROM_AMENDS,
            "userId");
        verify(workflowService, times(1)).completeTask("processTaskId");
    }
}
