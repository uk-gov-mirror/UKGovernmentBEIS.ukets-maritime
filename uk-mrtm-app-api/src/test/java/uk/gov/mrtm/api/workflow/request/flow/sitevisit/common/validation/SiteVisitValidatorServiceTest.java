package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.validation;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.common.exception.MrtmErrorCode;
import uk.gov.mrtm.api.sitevisit.domain.SiteVisitContainer;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestTaskType;
import uk.gov.mrtm.api.workflow.request.core.validation.WorkflowAttachmentsValidator;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisit;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitApplicationDetails;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecision;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitReviewDecisionType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitViolation;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.review.domain.SiteVisitApplicationReviewRequestTaskPayload;
import uk.gov.netz.api.authorization.core.domain.AppUser;
import uk.gov.netz.api.common.exception.BusinessException;
import uk.gov.netz.api.common.exception.ErrorCode;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.core.domain.RequestTaskType;
import uk.gov.netz.api.workflow.request.core.service.RequestTaskTypeService;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;
import uk.gov.netz.api.workflow.request.flow.common.validation.DecisionNotificationUsersValidator;
import uk.gov.netz.api.workflow.request.flow.common.validation.PeerReviewerTaskAssignmentValidator;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitValidatorServiceTest {

    @InjectMocks
    private SiteVisitValidatorService validatorService;

    @Mock
    private PeerReviewerTaskAssignmentValidator peerReviewerTaskAssignmentValidator;
    @Mock
    private RequestTaskTypeService requestTaskTypeService;
    @Mock
    private DecisionNotificationUsersValidator decisionNotificationUsersValidator;
    @Mock
    private WorkflowAttachmentsValidator workflowAttachmentsValidator;

    @Test
    void validateSiteVisit_valid() {
        UUID randomUUID = UUID.randomUUID();
        SiteVisit siteVisit = SiteVisit.builder()
            .applicationDetails(SiteVisitApplicationDetails.builder().files(Set.of(randomUUID)).build())
            .build();
        SiteVisitContainer siteVisitContainer = SiteVisitContainer.builder()
            .siteVisit(siteVisit)
            .siteVisitAttachments(Map.of(randomUUID, "filename"))
            .build();

        when(workflowAttachmentsValidator.attachmentsExist(Set.of(randomUUID))).thenReturn(true);
        when(workflowAttachmentsValidator.sectionAttachmentsReferencedInWorkflow(Set.of(randomUUID), Set.of(randomUUID))).thenReturn(true);

        validatorService.validateSiteVisit(siteVisitContainer);

        verify(workflowAttachmentsValidator).attachmentsExist(Set.of(randomUUID));
        verify(workflowAttachmentsValidator).sectionAttachmentsReferencedInWorkflow(Set.of(randomUUID), Set.of(randomUUID));

        verifyNoMoreInteractions(workflowAttachmentsValidator);
        verifyNoInteractions(requestTaskTypeService, peerReviewerTaskAssignmentValidator, decisionNotificationUsersValidator);
    }

    @Test
    void validateSiteVisit_invalid_ATTACHMENT_NOT_FOUND() {
        UUID randomUUID = UUID.randomUUID();
        SiteVisit siteVisit = SiteVisit.builder()
            .applicationDetails(SiteVisitApplicationDetails.builder().files(Set.of(randomUUID)).build())
            .build();
        SiteVisitContainer siteVisitContainer = SiteVisitContainer.builder()
            .siteVisit(siteVisit)
            .siteVisitAttachments(Map.of(randomUUID, "filename"))
            .build();

        when(workflowAttachmentsValidator.attachmentsExist(Set.of(randomUUID))).thenReturn(false);

        BusinessException businessException = assertThrows(
            BusinessException.class, () -> validatorService.validateSiteVisit(siteVisitContainer));
        assertThat(businessException.getErrorCode()).isEqualTo(MrtmErrorCode.INVALID_SITE_VISIT);
        assertEquals(businessException.getData()[0], SiteVisitViolation.ATTACHMENT_NOT_FOUND.getMessage());

        verify(workflowAttachmentsValidator).attachmentsExist(Set.of(randomUUID));

        verifyNoMoreInteractions(workflowAttachmentsValidator);
        verifyNoInteractions(requestTaskTypeService, peerReviewerTaskAssignmentValidator, decisionNotificationUsersValidator);
    }

    @Test
    void validateSiteVisit_invalid_ATTACHMENT_NOT_REFERENCED() {
        UUID randomUUID = UUID.randomUUID();
        SiteVisit siteVisit = SiteVisit.builder()
            .applicationDetails(SiteVisitApplicationDetails.builder().files(Set.of(randomUUID)).build())
            .build();
        SiteVisitContainer siteVisitContainer = SiteVisitContainer.builder()
            .siteVisit(siteVisit)
            .siteVisitAttachments(Map.of(randomUUID, "filename"))
            .build();

        when(workflowAttachmentsValidator.attachmentsExist(Set.of(randomUUID))).thenReturn(true);
        when(workflowAttachmentsValidator.sectionAttachmentsReferencedInWorkflow(Set.of(randomUUID), Set.of(randomUUID))).thenReturn(false);

        BusinessException businessException = assertThrows(
            BusinessException.class, () -> validatorService.validateSiteVisit(siteVisitContainer));
        assertThat(businessException.getErrorCode()).isEqualTo(MrtmErrorCode.INVALID_SITE_VISIT);
        assertEquals(businessException.getData()[0], SiteVisitViolation.ATTACHMENT_NOT_REFERENCED.getMessage());

        verify(workflowAttachmentsValidator).attachmentsExist(Set.of(randomUUID));
        verify(workflowAttachmentsValidator).sectionAttachmentsReferencedInWorkflow(Set.of(randomUUID), Set.of(randomUUID));

        verifyNoMoreInteractions(workflowAttachmentsValidator);
        verifyNoInteractions(requestTaskTypeService, peerReviewerTaskAssignmentValidator, decisionNotificationUsersValidator);
    }

    @Test
    void validatePeerReviewer() {
        RequestTask requestTask = mock(RequestTask.class);
        RequestTaskType requestTaskType = mock(RequestTaskType.class);
        String peerReviewer = "peerReviewer";
        AppUser appUser = mock(AppUser.class);

        when(requestTaskTypeService.findByCode(MrtmRequestTaskType.SITE_VISIT_APPLICATION_PEER_REVIEW)).thenReturn(requestTaskType);

        validatorService.validatePeerReviewer(requestTask, peerReviewer, appUser);

        verify(requestTaskTypeService).findByCode(MrtmRequestTaskType.SITE_VISIT_APPLICATION_PEER_REVIEW);
        verify(peerReviewerTaskAssignmentValidator).validate(requestTask, requestTaskType, peerReviewer, appUser);

        verifyNoMoreInteractions(requestTaskTypeService, peerReviewerTaskAssignmentValidator);
        verifyNoInteractions(decisionNotificationUsersValidator, workflowAttachmentsValidator);
    }

    @EnumSource(value = SiteVisitReviewDecisionType.class, names = {"ACCEPTED", "REJECTED"}, mode = EnumSource.Mode.INCLUDE)
    @ParameterizedTest
    void isDecisionAcceptedOrRejected_valid(SiteVisitReviewDecisionType type) {
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder().type(type).build();

        validatorService.isDecisionAcceptedOrRejected(reviewDecision);

        verifyNoInteractions(decisionNotificationUsersValidator, workflowAttachmentsValidator, requestTaskTypeService, peerReviewerTaskAssignmentValidator);
    }

    @Test
    void isDecisionAcceptedOrRejected_invalid() {
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder().type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED).build();

        final BusinessException exception = assertThrows(BusinessException.class, () ->
            validatorService.isDecisionAcceptedOrRejected(reviewDecision));

        assertEquals(MrtmErrorCode.INVALID_SITE_VISIT_PEER_REVIEW, exception.getErrorCode());

        verifyNoInteractions(decisionNotificationUsersValidator, workflowAttachmentsValidator, requestTaskTypeService, peerReviewerTaskAssignmentValidator);
    }

    @Test
    void validateSendForAmends_valid() {
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder().type(SiteVisitReviewDecisionType.OPERATOR_AMENDS_NEEDED).build();
        SiteVisitApplicationReviewRequestTaskPayload payload = SiteVisitApplicationReviewRequestTaskPayload.builder()
            .reviewDecision(reviewDecision)
            .build();

        validatorService.validateSendForAmends(payload);

        verifyNoInteractions(decisionNotificationUsersValidator, workflowAttachmentsValidator, requestTaskTypeService, peerReviewerTaskAssignmentValidator);
    }

    @EnumSource(value = SiteVisitReviewDecisionType.class, names = {"ACCEPTED", "REJECTED"}, mode = EnumSource.Mode.INCLUDE)
    @ParameterizedTest
    void validateSendForAmends_invalid(SiteVisitReviewDecisionType type) {
        SiteVisitReviewDecision reviewDecision = SiteVisitReviewDecision.builder().type(type).build();
        SiteVisitApplicationReviewRequestTaskPayload payload = SiteVisitApplicationReviewRequestTaskPayload.builder()
            .reviewDecision(reviewDecision)
            .build();

        final BusinessException exception = assertThrows(BusinessException.class, () ->
            validatorService.validateSendForAmends(payload));

        assertEquals(MrtmErrorCode.INVALID_SITE_VISIT_REVIEW, exception.getErrorCode());

        verifyNoInteractions(decisionNotificationUsersValidator, workflowAttachmentsValidator, requestTaskTypeService, peerReviewerTaskAssignmentValidator);
    }

    @Test
    void validateNotifyUsers_valid() {
        final RequestTask requestTask = mock(RequestTask.class);
        final DecisionNotification decisionNotification = mock(DecisionNotification.class);
        final AppUser appUser = mock(AppUser.class);

        when(decisionNotificationUsersValidator.areUsersValid(requestTask, decisionNotification, appUser)).thenReturn(true);

        validatorService.validateNotifyUsers(requestTask, decisionNotification, appUser);

        verify(decisionNotificationUsersValidator).areUsersValid(requestTask, decisionNotification, appUser);
        verifyNoMoreInteractions(decisionNotificationUsersValidator);
        verifyNoInteractions(workflowAttachmentsValidator, requestTaskTypeService, peerReviewerTaskAssignmentValidator);
    }

    @Test
    void validateNotifyUsers_invalid() {
        final RequestTask requestTask = mock(RequestTask.class);
        final DecisionNotification decisionNotification = mock(DecisionNotification.class);
        final AppUser appUser = mock(AppUser.class);

        when(decisionNotificationUsersValidator.areUsersValid(requestTask, decisionNotification, appUser)).thenReturn(false);

        final BusinessException exception = assertThrows(BusinessException.class, () ->
            validatorService.validateNotifyUsers(requestTask, decisionNotification, appUser));

        assertEquals(ErrorCode.FORM_VALIDATION, exception.getErrorCode());

        verify(decisionNotificationUsersValidator).areUsersValid(requestTask, decisionNotification, appUser);
        verifyNoMoreInteractions(decisionNotificationUsersValidator);
        verifyNoInteractions(workflowAttachmentsValidator, requestTaskTypeService, peerReviewerTaskAssignmentValidator);
    }
}