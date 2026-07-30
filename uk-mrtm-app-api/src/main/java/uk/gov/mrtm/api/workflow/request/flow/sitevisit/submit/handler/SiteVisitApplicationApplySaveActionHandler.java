package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.domain.SiteVisitApplicationSaveRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.service.RequestSiteVisitService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;

import java.util.List;

@RequiredArgsConstructor
@Component
public class SiteVisitApplicationApplySaveActionHandler implements RequestTaskActionHandler<SiteVisitApplicationSaveRequestTaskActionPayload> {

    private final RequestTaskService requestTaskService;
    private final RequestSiteVisitService requestSiteVisitService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser,
                                      SiteVisitApplicationSaveRequestTaskActionPayload payload) {
        final RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);
        requestSiteVisitService.applySavePayload(payload, requestTask);

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.SITE_VISIT_SAVE_APPLICATION);
    }
}
