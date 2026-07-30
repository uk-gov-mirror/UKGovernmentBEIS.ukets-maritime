package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitSaveApplicationAmendRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.RequestSiteVisitReviewService;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SiteVisitSaveApplicationAmendActionHandler implements
    RequestTaskActionHandler<SiteVisitSaveApplicationAmendRequestTaskActionPayload> {

    private final RequestTaskService requestTaskService;
    private final RequestSiteVisitReviewService siteVisitReviewService;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser,
                                      SiteVisitSaveApplicationAmendRequestTaskActionPayload payload) {
        RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);
        siteVisitReviewService.saveAmend(payload, requestTask);

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.SITE_VISIT_SAVE_APPLICATION_AMEND);
    }
}
