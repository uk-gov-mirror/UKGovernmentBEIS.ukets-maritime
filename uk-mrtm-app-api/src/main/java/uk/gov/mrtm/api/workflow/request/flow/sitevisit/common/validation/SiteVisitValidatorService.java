package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import uk.gov.mrtm.api.common.exception.MrtmErrorCode;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.core.validation.WorkflowAttachmentsValidator;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitViolation;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskTypeService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.validation.DecisionNotificationUsersValidator;
import uk.gov.netz.api.workflow.request.flow.common.validation.PeerReviewerTaskAssignmentValidator;

@Service
@Validated
@RequiredArgsConstructor
public class SiteVisitValidatorService {

    private final PeerReviewerTaskAssignmentValidator peerReviewerTaskAssignmentValidator;
    private final RequestTaskTypeService requestTaskTypeService;
    private final DecisionNotificationUsersValidator decisionNotificationUsersValidator;
    private final WorkflowAttachmentsValidator workflowAttachmentsValidator;

    public void validateSiteVisit(@Valid @NotNull SiteVisitContainer siteVisitContainer) {
        if (!workflowAttachmentsValidator.attachmentsExist(siteVisitContainer
            .getSiteVisit().getSiteVisitSectionAttachmentIds())) {
            throw new BusinessException(MrtmErrorCode.INVALID_SITE_VISIT,
                SiteVisitViolation.ATTACHMENT_NOT_FOUND.getMessage());
        }

        if (!workflowAttachmentsValidator.sectionAttachmentsReferencedInWorkflow(
            siteVisitContainer.getSiteVisit().getSiteVisitSectionAttachmentIds(),
            siteVisitContainer.getSiteVisitAttachments().keySet())) {
            throw new BusinessException(MrtmErrorCode.INVALID_SITE_VISIT,
                SiteVisitViolation.ATTACHMENT_NOT_REFERENCED.getMessage());
        }
    }

    public void validateReviewDecision(@NotNull @Valid final SiteVisitReviewDecision reviewDecision) {
        // Validate
    }

    public void validatePeerReviewer(RequestTask requestTask, final String peerReviewer, final AppUser appUser) {
        peerReviewerTaskAssignmentValidator.validate(requestTask,
            requestTaskTypeService.findByCode(MrtmRequestTaskType.SITE_VISIT_APPLICATION_PEER_REVIEW),
            peerReviewer,
            appUser);
    }

    public void isDecisionAcceptedOrRejected(SiteVisitReviewDecision reviewDecision) {
        boolean validForPeerReview = (reviewDecision.getType() == SiteVisitReviewDecisionType.ACCEPTED
            || reviewDecision.getType() == SiteVisitReviewDecisionType.REJECTED);

        if (!validForPeerReview) {
            throw new BusinessException(MrtmErrorCode.INVALID_SITE_VISIT_PEER_REVIEW);
        }
    }

    public void validateSendForAmends(final SiteVisitApplicationReviewRequestTaskPayload taskPayload) {

        boolean validForAmends = taskPayload.getReviewDecision().getType() == SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED;
        if (!validForAmends) {
            throw new BusinessException(MrtmErrorCode.INVALID_SITE_VISIT_REVIEW);
        }
    }

    public void validateNotifyUsers(final RequestTask requestTask,
                                    final DecisionNotification decisionNotification,
                                    final AppUser appUser) {
        if (!decisionNotificationUsersValidator.areUsersValid(requestTask, decisionNotification, appUser)) {
            throw new BusinessException(ErrorCode.FORM_VALIDATION);
        }
    }
}
