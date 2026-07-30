package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.constants.MrtmBpmnProcessConstants;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitSubmitOutcome;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSubmitRequestTaskPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitApplicationCancelActionHandlerTest {

    @InjectMocks
    private SiteVisitApplicationCancelActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private WorkflowService workflowService;

    @Test
    void process() {
        Long requestTaskId = 1L;
        AppUser appUser = AppUser.builder().userId("userId").build();
        RequestTaskActionEmptyPayload taskActionPayload = mock(RequestTaskActionEmptyPayload.class);
        String processTaskId = "processTaskId";
        RequestTask requestTask = RequestTask.builder()
            .payload(SiteVisitApplicationSubmitRequestTaskPayload.builder().build())
            .processTaskId(processTaskId)
            .build();
        SiteVisitApplicationSubmitRequestTaskPayload expectedRequestTaskPayload =
            SiteVisitApplicationSubmitRequestTaskPayload.builder().build();

        when(requestTaskService.findTaskById(requestTaskId)).thenReturn(requestTask);

        // Invoke
        RequestTaskPayload requestTaskPayload = handler.process(requestTaskId,
            "requestTaskActionType", appUser, taskActionPayload);

        // Verify
        assertThat(requestTaskPayload).isEqualTo(expectedRequestTaskPayload);
        verify(requestTaskService).findTaskById(requestTaskId);
        verify(workflowService).completeTask(processTaskId,
            Map.of(MrtmBpmnProcessConstants.SITE_VISIT_SUBMIT_OUTCOME, SiteVisitSubmitOutcome.CANCELLED));

        verifyNoMoreInteractions(requestTaskService, workflowService);
    }

    @Test
    void getType() {
        assertThat(handler.getTypes()).isEqualTo(List.of(MrtmRequestTaskActionType.SITE_VISIT_CANCEL_APPLICATION));
    }
}