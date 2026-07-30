package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SiteVisitSubmitApplicationAmendActionHandler implements
    RequestTaskActionHandler<RequestTaskActionEmptyPayload> {

    private final RequestTaskService requestTaskService;
    private final RequestService requestService;
    private final RequestSiteVisitReviewService requestSiteVisitReviewService;
    private final WorkflowService workflowService;
    private final SiteVisitValidatorService validatorService;
    private final SiteVisitReviewMapper siteVisitReviewMapper;
    private final SiteVisitSubmitMapper siteVisitSubmitMapper;

    @Override
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser,
                                      RequestTaskActionEmptyPayload payload) {

        RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);

        SiteVisitApplicationAmendsSubmitRequestTaskPayload taskPayload =
            (SiteVisitApplicationAmendsSubmitRequestTaskPayload) requestTask.getPayload();

        // Validate
        SiteVisitContainer siteVisitContainer = siteVisitSubmitMapper.toSiteVisitContainer(taskPayload);
        validatorService.validateSiteVisit(siteVisitContainer);

        requestSiteVisitReviewService.submitAmend(requestTask);

        // Add timeline
        addAmendsSubmittedRequestAction(requestTask.getRequest(), taskPayload, appUser);

        workflowService.completeTask(requestTask.getProcessTaskId());

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.SITE_VISIT_SUBMIT_APPLICATION_AMEND);
    }

    private void addAmendsSubmittedRequestAction(Request request,
                                                 SiteVisitApplicationAmendsSubmitRequestTaskPayload requestTaskPayload,
                                                 AppUser appUser) {

        SiteVisitApplicationAmendsSubmittedRequestActionPayload amendsSubmittedRequestActionPayload =
            siteVisitReviewMapper.toSiteVisitApplicationAmendsSubmittedRequestActionPayload(requestTaskPayload,
                MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_AMENDS_SUBMITTED_PAYLOAD);

        requestService.addActionToRequest(
            request,
            amendsSubmittedRequestActionPayload,
            MrtmRequestActionType.SITE_VISIT_APPLICATION_AMENDS_SUBMITTED,
            appUser.getUserId());
    }
}
