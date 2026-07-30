package uk.gov.mrtm.api.workflow.request.flow.empvariation.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.constants.MrtmBpmnProcessConstants;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationSubmitOutcome;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmpVariationCancelActionHandler implements RequestTaskActionHandler<RequestTaskActionEmptyPayload> {

	private final RequestTaskService requestTaskService;
    private final WorkflowService workflowService;

    @Override
    public RequestTaskPayload process(final Long requestTaskId,
                                      final String requestTaskActionType,
                                      final AppUser appUser,
                                      final RequestTaskActionEmptyPayload taskActionPayload) {

        final RequestTask requestTask = requestTaskService.findTaskByIdForUpdate(requestTaskId);
        final String userRole = appUser.getRoleType();

        workflowService.completeTask(requestTask.getProcessTaskId(),
            Map.of(MrtmBpmnProcessConstants.EMP_VARIATION_SUBMIT_OUTCOME, EmpVariationSubmitOutcome.CANCELLED,
                   BpmnProcessConstants.REQUEST_INITIATOR_ROLE_TYPE, userRole));

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.EMP_VARIATION_CANCEL_APPLICATION);
    }
}
