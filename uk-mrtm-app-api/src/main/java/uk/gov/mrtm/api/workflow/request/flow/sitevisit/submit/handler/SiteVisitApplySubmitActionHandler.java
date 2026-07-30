package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.common.constants.MrtmBpmnProcessConstants;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitSubmitOutcome;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.service.RequestSiteVisitService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SiteVisitApplySubmitActionHandler implements RequestTaskActionHandler<RequestTaskActionEmptyPayload> {

    private final RequestSiteVisitService requestSiteVisitService;
    private final WorkflowService workflowService;
    private final RequestTaskService requestTaskService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser, RequestTaskActionEmptyPayload payload) {
        RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);

        requestSiteVisitService.applySubmitAction(requestTask, appUser);

        requestTask.getRequest().setSubmissionDate(LocalDateTime.now());

        workflowService.completeTask(
                requestTask.getProcessTaskId(),
                Map.of(MrtmBpmnProcessConstants.SITE_VISIT_SUBMIT_OUTCOME, SiteVisitSubmitOutcome.SUBMITTED)
        );

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.SITE_VISIT_SUBMIT_APPLICATION);
    }
}
