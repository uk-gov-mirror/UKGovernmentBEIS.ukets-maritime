package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionPayloadType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskActionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation.SiteVisitValidatorService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReturnedForAmendsRequestActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service.RequestSiteVisitReviewService;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.transform.SiteVisitReviewMapper;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.WorkflowService;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskPayload;
import uk.gov.netz.api.workflow.request.core.service.RequestService;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskService;
import uk.gov.netz.api.workflow.request.flow.common.actionhandler.RequestTaskActionHandler;
import uk.gov.netz.api.workflow.request.flow.common.constants.BpmnProcessConstants;
import uk.gov.netz.api.workflow.request.flow.common.domain.RequestTaskActionEmptyPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.ReviewOutcome;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SiteVisitReviewReturnForAmendsHandler implements RequestTaskActionHandler<RequestTaskActionEmptyPayload> {

	private final RequestTaskService requestTaskService;
    private final RequestService requestService;
    private final RequestSiteVisitReviewService siteVisitReviewService;
    private final SiteVisitValidatorService validatorService;
    private final WorkflowService workflowService;
    private final SiteVisitReviewMapper mapper;

    @Override
    @Transactional
    public RequestTaskPayload process(Long requestTaskId, String requestTaskActionType, AppUser appUser, RequestTaskActionEmptyPayload payload) {
        final RequestTask requestTask = requestTaskService.findTaskById(requestTaskId);
        SiteVisitApplicationReviewRequestTaskPayload taskPayload = (SiteVisitApplicationReviewRequestTaskPayload) requestTask.getPayload();

        // Validate review is 'Operator to amend'
        validatorService.validateReviewDecision(taskPayload.getReviewDecision());
        validatorService.validateSendForAmends(taskPayload);

        // Update request payload
        siteVisitReviewService.saveRequestReturnForAmends(requestTask, appUser);

        // Add request action
        createRequestAction(requestTask.getRequest(), appUser, taskPayload);

        // Close task
        workflowService.completeTask(requestTask.getProcessTaskId(),
            Map.of(BpmnProcessConstants.REVIEW_OUTCOME, ReviewOutcome.AMENDS_NEEDED));

        return requestTask.getPayload();
    }

    @Override
    public List<String> getTypes() {
        return List.of(MrtmRequestTaskActionType.SITE_VISIT_REVIEW_RETURN_FOR_AMENDS);
    }

    private void createRequestAction(Request request, AppUser appUser, SiteVisitApplicationReviewRequestTaskPayload taskPayload) {
        SiteVisitApplicationReturnedForAmendsRequestActionPayload requestActionPayload = mapper
                .toSiteVisitApplicationReturnedForAmendsRequestActionPayload(
                    taskPayload,
                    MrtmRequestActionPayloadType.SITE_VISIT_APPLICATION_RETURNED_FOR_AMENDS_PAYLOAD
                );

        requestService.addActionToRequest(request, requestActionPayload,
            MrtmRequestActionType.SITE_VISIT_APPLICATION_RETURNED_FOR_AMENDS, appUser.getUserId());
    }
}
