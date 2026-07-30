package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.constants.MrtmBpmnProcessConstants;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitSubmitOutcome;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Component
public class SiteVisitApplicationCancelActionHandler implements RequestTaskActionHandler<RequestTaskActionEmptyPayload> {

    private final WorkflowService workflowService;
    private final RequestTaskService requestTaskService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser,
                                      RequestTaskActionEmptyPayload payload) {

        final RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);

        // Complete task
        workflowService.completeTask(requestTask.getProcessTaskId(),
                Map.of(MrtmBpmnProcessConstants.SITE_VISIT_SUBMIT_OUTCOME, SiteVisitSubmitOutcome.CANCELLED));

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.SITE_VISIT_CANCEL_APPLICATION);
    }
}
