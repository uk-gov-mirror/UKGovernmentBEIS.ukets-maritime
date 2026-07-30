package uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationAmendsSubmitRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitSaveApplicationAmendRequestTaskActionPayload;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.flow.common.domain.NotifyOperatorForDecisionRequestTaskActionPayload;
import uk.gov.netz.api.workflow.request.flow.common.domain.review.ChangesRequiredDecisionDetails;

@Service
@RequiredArgsConstructor
public class RequestSiteVisitReviewService {

    @Transactional
    public void saveReviewDecision(SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload taskActionPayload, RequestTask requestTask) {

        SiteVisitApplicationReviewRequestTaskPayload requestTaskPayload =
                (SiteVisitApplicationReviewRequestTaskPayload) requestTask.getPayload();

        requestTaskPayload.setReviewDecision(taskActionPayload.getReviewDecision());
        requestTaskPayload.setSectionsCompleted(taskActionPayload.getSectionsCompleted());
    }

    @Transactional
    public void saveRequestPeerReviewAction(RequestTask requestTask, String selectedPeerReview, AppUser appUser) {
        final Request request = requestTask.getRequest();
        final SiteVisitApplicationReviewRequestTaskPayload taskPayload =
            (SiteVisitApplicationReviewRequestTaskPayload) requestTask.getPayload();
        final SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();

        requestPayload.setReviewDecision(taskPayload.getReviewDecision());
        requestPayload.setRegulatorReviewer(appUser.getUserId());
        requestPayload.setReviewSectionsCompleted(taskPayload.getSectionsCompleted());
        requestPayload.setReviewAttachments(taskPayload.getReviewAttachments());
        requestPayload.setRegulatorPeerReviewer(selectedPeerReview);
    }

    @Transactional
    public void saveRequestReturnForAmends(RequestTask requestTask, AppUser appUser) {
        Request request = requestTask.getRequest();
        SiteVisitApplicationReviewRequestTaskPayload taskPayload =
            (SiteVisitApplicationReviewRequestTaskPayload) requestTask.getPayload();

        SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();

        requestPayload.setReviewDecision(taskPayload.getReviewDecision());
        requestPayload.setRegulatorReviewer(appUser.getUserId());
        requestPayload.setReviewAttachments(taskPayload.getReviewAttachments());
        requestPayload.setReviewSectionsCompleted(taskPayload.getSectionsCompleted());
        requestPayload.setAmendsSectionsCompleted(taskPayload.getSectionsCompleted());
    }

    @Transactional
    public void submit(RequestTask requestTask,
                       NotifyOperatorForDecisionRequestTaskActionPayload taskActionPayload,
                       AppUser appUser) {

        final Request request = requestTask.getRequest();
        final SiteVisitApplicationReviewRequestTaskPayload reviewTaskPayload =
            (SiteVisitApplicationReviewRequestTaskPayload) requestTask.getPayload();
        final SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();

        requestPayload.setReviewDecision(reviewTaskPayload.getReviewDecision());
        requestPayload.setReviewSectionsCompleted(reviewTaskPayload.getSectionsCompleted());
        requestPayload.setDecisionNotification(taskActionPayload.getDecisionNotification());
        requestPayload.setReviewAttachments(reviewTaskPayload.getReviewAttachments());
        requestPayload.setRegulatorReviewer(appUser.getUserId());
    }

    @Transactional
    public void saveAmend(SiteVisitSaveApplicationAmendRequestTaskActionPayload taskActionPayload, RequestTask requestTask) {

        SiteVisitApplicationAmendsSubmitRequestTaskPayload requestTaskPayload =
            (SiteVisitApplicationAmendsSubmitRequestTaskPayload) requestTask.getPayload();

        requestTaskPayload.setSiteVisit(taskActionPayload.getSiteVisit());
        requestTaskPayload.setSectionsCompleted(taskActionPayload.getSectionsCompleted());
        requestTaskPayload.setUpdatedSubtask(taskActionPayload.isUpdatedSubtask());
    }

    @Transactional
    public void submitAmend(RequestTask requestTask) {
        Request request = requestTask.getRequest();
        SiteVisitApplicationAmendsSubmitRequestTaskPayload taskPayload =
            (SiteVisitApplicationAmendsSubmitRequestTaskPayload) requestTask.getPayload();

        // Update request payload
        SiteVisitRequestPayload requestPayload = (SiteVisitRequestPayload) request.getPayload();

        resetTypeOnUpdatedReviewGroupDecisions(taskPayload, requestPayload);
        requestPayload.setSiteVisitAttachments(taskPayload.getSiteVisitAttachments());
        requestPayload.setSiteVisit(taskPayload.getSiteVisit());
        requestPayload.setAmendsSectionsCompleted(taskPayload.getSectionsCompleted());
    }

    private void resetTypeOnUpdatedReviewGroupDecisions(SiteVisitApplicationAmendsSubmitRequestTaskPayload taskPayload,
                                                        SiteVisitRequestPayload requestPayload) {

        if (taskPayload.isUpdatedSubtask()) {
            SiteVisitReviewDecision decision = requestPayload.getReviewDecision();
            if (SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED == decision.getType()) {
                ((ChangesRequiredDecisionDetails) decision.getDetails()).setRequiredChanges(null);
            }
            decision.setType(null);
        }
    }
}
