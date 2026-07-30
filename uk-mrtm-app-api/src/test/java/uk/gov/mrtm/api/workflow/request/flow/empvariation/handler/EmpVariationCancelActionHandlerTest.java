package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.constants.MrtmBpmnProcessConstants;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSubmitOutcome;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.constants.RoleTypeConstants;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmpVariationCancelActionHandlerTest {

    @InjectMocks
    private EmpVariationCancelActionHandler handler;

    @Mock
    private RequestTaskService requestTaskService;

    @Mock
    private WorkflowService workflowService;

    @Test
    void process() {
        final AppUser appUser = AppUser.builder().userId("userId").roleType(RoleTypeConstants.OPERATOR).build();
        final String processTaskId = "processTaskId";
        final RequestTaskPayload expectedRequestTaskPayload = mock(RequestTaskPayload.class);
        final Request request = Request.builder()
            .id("requestId")
            .build();
        final RequestTask requestTask = RequestTask.builder()
            .id(1L)
            .request(request)
            .payload(expectedRequestTaskPayload)
            .processTaskId(processTaskId)
            .build();

        when(requestTaskService.findTaskByIdForUpdate(1L)).thenReturn(requestTask);

        //invoke
        RequestTaskPayload requestTaskPayload = handler.process(requestTask.getId(),
            MrtmRequestTaskActionType.EMP_VARIATION_CANCEL_APPLICATION,
            appUser,
            RequestTaskActionEmptyPayload.builder().build());

        // Verify
        assertThat(requestTaskPayload).isEqualTo(expectedRequestTaskPayload);
        verifyNoMoreInteractions(expectedRequestTaskPayload);
        verify(requestTaskService, times(1)).findTaskByIdForUpdate(requestTask.getId());
        verify(workflowService, times(1)).completeTask(processTaskId,
            Map.of(MrtmBpmnProcessConstants.EMP_VARIATION_SUBMIT_OUTCOME, EmpVariationSubmitOutcome.CANCELLED,
                BpmnProcessConstants.REQUEST_INITIATOR_ROLE_TYPE, RoleTypeConstants.OPERATOR));
    }

    @Test
    void getTypes() {
        assertThat(handler.getTypes()).isEqualTo(List.of(MrtmRequestTaskActionType.EMP_VARIATION_CANCEL_APPLICATION));
    }
}