import { RequestTaskPageContentFactoryMap } from '@netz/common/request-task';

import { requestDeadlineExtensionSubmitTaskContent } from '@requests/common/emp/request-deadline-extension';
import {
  requestForInformationRespondTaskContent,
  requestForInformationWaitForResponseTaskContent,
} from '@requests/common/emp/request-for-information';
import { accountClosureTaskContent } from '@requests/tasks/account-closure/account-closure-task-content';
import { aerAmendsTaskContent } from '@requests/tasks/aer-amend';
import { aerReviewTaskContent } from '@requests/tasks/aer-review';
import { aerSubmitTaskContent } from '@requests/tasks/aer-submit/aer-submit-task-content';
import { aerVerificationSubmitTaskContent } from '@requests/tasks/aer-verification-submit/aer-verification-submit-task-content';
import { aerWaitForReviewTaskContent } from '@requests/tasks/aer-wait-for-review';
import { aerWaitForVerificationTaskContent } from '@requests/tasks/aer-wait-for-verification/aer-wait-for-verification-task-content';
import { doePeerReviewTaskContent } from '@requests/tasks/doe-peer-review';
import { doeSubmitTaskContent } from '@requests/tasks/doe-submit/doe-submit-task-content';
import { empAmendTaskContent } from '@requests/tasks/emp-amend';
import { empPeerReviewTaskContent } from '@requests/tasks/emp-peer-review';
import { empReviewTaskContent } from '@requests/tasks/emp-review';
import { empSubmitTaskContent } from '@requests/tasks/emp-submit/emp-submit-task-content';
import { empVariationTaskContent } from '@requests/tasks/emp-variation';
import { empVariationAmendTaskContent } from '@requests/tasks/emp-variation-amend';
import { empVariationPeerReviewTaskContent } from '@requests/tasks/emp-variation-peer-review';
import { empVariationRegulatorTaskContent } from '@requests/tasks/emp-variation-regulator';
import { empVariationRegulatorPeerReviewTaskContent } from '@requests/tasks/emp-variation-regulator-peer-review';
import { empVariationRegulatorWaitForPeerReviewTaskContent } from '@requests/tasks/emp-variation-regulator-wait-for-peer-review';
import { empVariationReviewTaskContent } from '@requests/tasks/emp-variation-review';
import { empVariationWaitForAmendTaskContent } from '@requests/tasks/emp-variation-wait-for-amend';
import { empVariationWaitForPeerReviewTaskContent } from '@requests/tasks/emp-variation-wait-for-peer-review';
import { empVariationWaitForReviewTaskContent } from '@requests/tasks/emp-variation-wait-for-review';
import { empWaitForAmendTaskContent } from '@requests/tasks/emp-wait-for-amend';
import { empWaitForPeerReviewTaskContent } from '@requests/tasks/emp-wait-for-peer-review';
import { empWaitForReviewTaskContent } from '@requests/tasks/emp-wait-for-review';
import { nonComplianceCivilPenaltyTaskContent } from '@requests/tasks/non-compliance-civil-penalty/non-compliance-civil-penalty-task-content';
import { nonComplianceCivilPenaltyPeerReviewTaskContent } from '@requests/tasks/non-compliance-civil-penalty-peer-review/non-compliance-civil-penalty-peer-review.task-content';
import { nonComplianceFinalDeterminationTaskContent } from '@requests/tasks/non-compliance-final-determination/non-compliance-final-determination-task-content';
import { nonComplianceInitialPenaltyNoticeTaskContent } from '@requests/tasks/non-compliance-initial-penalty-notice/non-compliance-initial-penalty-notice-task-content';
import { nonComplianceInitialPenaltyNoticePeerReviewTaskContent } from '@requests/tasks/non-compliance-initial-penalty-notice-peer-review/non-compliance-initial-penalty-notice-peer-review.task-content';
import { nonComplianceNoticeOfIntentTaskContent } from '@requests/tasks/non-compliance-notice-of-intent/non-compliance-notice-of-intent-task-content';
import { nonComplianceNoticeOfIntentPeerReviewTaskContent } from '@requests/tasks/non-compliance-notice-of-intent-peer-review';
import { nonComplianceSubmitTaskContent } from '@requests/tasks/non-compliance-submit/non-compliance-submit-task-content';
import { followUpTaskContent } from '@requests/tasks/notification-follow-up/follow-up-task-content';
import { followUpAmendTaskContent } from '@requests/tasks/notification-follow-up-amend/follow-up-amend-task-content';
import { followUpReviewTaskContent } from '@requests/tasks/notification-follow-up-review/follow-up-review-task-content';
import { peerReviewTaskContent } from '@requests/tasks/notification-peer-review/peer-review-task-content';
import { reviewTaskContent } from '@requests/tasks/notification-review/review-task-content';
import { notificationTaskContent } from '@requests/tasks/notification-submit/notification-task-content';
import { waitForAmendsTaskContent } from '@requests/tasks/notification-wait-for-amends/wait-for-amends-task-content';
import { waitForFollowUpTaskContent } from '@requests/tasks/notification-wait-for-follow-up/wait-for-follow-up-task-content';
import { waitForFollowUpReviewTaskContent } from '@requests/tasks/notification-wait-for-follow-up-review/wait-for-follow-up-review-task-content';
import { waitForPeerReviewTaskContent } from '@requests/tasks/notification-wait-for-peer-review/wait-for-peer-review-task-content';
import { waitForReviewTaskContent } from '@requests/tasks/notification-wait-for-review/wait-for-review-task-content';
import { paymentTaskContent } from '@requests/tasks/payment';
import { siteVisitAmendsTaskContent } from '@requests/tasks/site-visit-amends';
import { siteVisitPeerReviewTaskContent } from '@requests/tasks/site-visit-peer-review';
import { siteVisitReviewTaskContent } from '@requests/tasks/site-visit-review';
import { siteVisitSubmitTaskContent } from '@requests/tasks/site-visit-submit';
import { siteVisitWaitForReviewTaskContent } from '@requests/tasks/site-visit-wait-for-review';
import { systemMessageNotificationTaskContent } from '@requests/tasks/system-message-notification/system-message-notification-task-content';
import { virRespondToRegulatorCommentsTaskContent } from '@requests/tasks/vir-respond-to-regulator-comments/vir-respond-to-regulator-comments-task-content';
import { virReviewTaskContent } from '@requests/tasks/vir-review';
import { virSubmitTaskContent } from '@requests/tasks/vir-submit/vir-submit-task-content';
import { virWaitForReviewTaskContent } from '@requests/tasks/vir-wait-for-review';

export const tasksContent: RequestTaskPageContentFactoryMap = {
  ACCOUNT_CLOSURE_SUBMIT: accountClosureTaskContent,
  EMP_ISSUANCE_APPLICATION_SUBMIT: empSubmitTaskContent,
  EMP_ISSUANCE_APPLICATION_AMENDS_SUBMIT: empAmendTaskContent,
  EMP_ISSUANCE_APPLICATION_REVIEW: empReviewTaskContent,
  EMP_VARIATION_APPLICATION_SUBMIT: empVariationTaskContent,
  EMP_NOTIFICATION_APPLICATION_SUBMIT: notificationTaskContent,
  EMP_NOTIFICATION_APPLICATION_REVIEW: reviewTaskContent,
  EMP_NOTIFICATION_APPLICATION_PEER_REVIEW: peerReviewTaskContent,
  EMP_NOTIFICATION_FOLLOW_UP: followUpTaskContent,
  EMP_NOTIFICATION_WAIT_FOR_REVIEW: waitForReviewTaskContent,
  EMP_NOTIFICATION_FOLLOW_UP_WAIT_FOR_REVIEW: waitForFollowUpReviewTaskContent,
  EMP_NOTIFICATION_FOLLOW_UP_APPLICATION_REVIEW: followUpReviewTaskContent,
  EMP_NOTIFICATION_FOLLOW_UP_APPLICATION_AMENDS_SUBMIT: followUpAmendTaskContent,
  EMP_NOTIFICATION_FOLLOW_UP_WAIT_FOR_AMENDS: waitForAmendsTaskContent,
  EMP_VARIATION_APPLICATION_REVIEW: empVariationReviewTaskContent,
  EMP_ISSUANCE_APPLICATION_PEER_REVIEW: empPeerReviewTaskContent,
  EMP_ISSUANCE_WAIT_FOR_PEER_REVIEW: empWaitForPeerReviewTaskContent,
  EMP_VARIATION_WAIT_FOR_PEER_REVIEW: empVariationWaitForPeerReviewTaskContent,
  EMP_VARIATION_REGULATOR_LED_WAIT_FOR_PEER_REVIEW: empVariationRegulatorWaitForPeerReviewTaskContent,
  EMP_NOTIFICATION_WAIT_FOR_FOLLOW_UP: waitForFollowUpTaskContent,
  EMP_VARIATION_WAIT_FOR_REVIEW: empVariationWaitForReviewTaskContent,
  EMP_ISSUANCE_WAIT_FOR_REVIEW: empWaitForReviewTaskContent,
  EMP_ISSUANCE_WAIT_FOR_AMENDS: empWaitForAmendTaskContent,
  EMP_VARIATION_REGULATOR_LED_APPLICATION_SUBMIT: empVariationRegulatorTaskContent,
  EMP_VARIATION_APPLICATION_PEER_REVIEW: empVariationPeerReviewTaskContent,
  EMP_VARIATION_REGULATOR_LED_APPLICATION_PEER_REVIEW: empVariationRegulatorPeerReviewTaskContent,
  EMP_VARIATION_WAIT_FOR_AMENDS: empVariationWaitForAmendTaskContent,
  EMP_NOTIFICATION_WAIT_FOR_PEER_REVIEW: waitForPeerReviewTaskContent,
  EMP_VARIATION_APPLICATION_AMENDS_SUBMIT: empVariationAmendTaskContent,
  EMP_ISSUANCE_WAIT_FOR_RDE_RESPONSE: requestDeadlineExtensionSubmitTaskContent,
  EMP_ISSUANCE_RDE_RESPONSE_SUBMIT: requestDeadlineExtensionSubmitTaskContent,
  EMP_VARIATION_RDE_RESPONSE_SUBMIT: requestDeadlineExtensionSubmitTaskContent,
  EMP_VARIATION_WAIT_FOR_RDE_RESPONSE: requestDeadlineExtensionSubmitTaskContent,
  EMP_ISSUANCE_WAIT_FOR_RFI_RESPONSE: requestForInformationWaitForResponseTaskContent,
  EMP_ISSUANCE_RFI_RESPONSE_SUBMIT: requestForInformationRespondTaskContent,
  EMP_NOTIFICATION_RFI_RESPONSE_SUBMIT: requestForInformationRespondTaskContent,
  EMP_NOTIFICATION_WAIT_FOR_RFI_RESPONSE: requestForInformationWaitForResponseTaskContent,
  EMP_VARIATION_WAIT_FOR_RFI_RESPONSE: requestForInformationWaitForResponseTaskContent,
  EMP_VARIATION_RFI_RESPONSE_SUBMIT: requestForInformationRespondTaskContent,
  AER_APPLICATION_SUBMIT: aerSubmitTaskContent,
  AER_WAIT_FOR_VERIFICATION: aerWaitForVerificationTaskContent,
  AER_WAIT_FOR_REVIEW: aerWaitForReviewTaskContent,
  AER_APPLICATION_VERIFICATION_SUBMIT: aerVerificationSubmitTaskContent,
  DOE_APPLICATION_SUBMIT: doeSubmitTaskContent,
  DOE_WAIT_FOR_PEER_REVIEW: doeSubmitTaskContent,
  DOE_APPLICATION_PEER_REVIEW: doePeerReviewTaskContent,
  VIR_APPLICATION_SUBMIT: virSubmitTaskContent,
  VIR_APPLICATION_REVIEW: virReviewTaskContent,
  VIR_RFI_RESPONSE_SUBMIT: requestForInformationRespondTaskContent,
  VIR_WAIT_FOR_RFI_RESPONSE: requestForInformationWaitForResponseTaskContent,
  VIR_RESPOND_TO_REGULATOR_COMMENTS: virRespondToRegulatorCommentsTaskContent,
  VIR_WAIT_FOR_REVIEW: virWaitForReviewTaskContent,
  EMP_ISSUANCE_MAKE_PAYMENT: paymentTaskContent,
  EMP_ISSUANCE_CONFIRM_PAYMENT: paymentTaskContent,
  EMP_ISSUANCE_TRACK_PAYMENT: paymentTaskContent,
  EMP_VARIATION_MAKE_PAYMENT: paymentTaskContent,
  EMP_VARIATION_CONFIRM_PAYMENT: paymentTaskContent,
  EMP_VARIATION_TRACK_PAYMENT: paymentTaskContent,
  EMP_VARIATION_REGULATOR_LED_MAKE_PAYMENT: paymentTaskContent,
  EMP_VARIATION_REGULATOR_LED_CONFIRM_PAYMENT: paymentTaskContent,
  EMP_VARIATION_REGULATOR_LED_TRACK_PAYMENT: paymentTaskContent,
  DOE_MAKE_PAYMENT: paymentTaskContent,
  DOE_CONFIRM_PAYMENT: paymentTaskContent,
  DOE_TRACK_PAYMENT: paymentTaskContent,
  AER_APPLICATION_REVIEW: aerReviewTaskContent,
  AER_WAIT_FOR_AMENDS: aerReviewTaskContent,
  AER_APPLICATION_AMENDS_SUBMIT: aerAmendsTaskContent,
  AER_AMEND_WAIT_FOR_VERIFICATION: aerWaitForVerificationTaskContent,
  AER_AMEND_APPLICATION_VERIFICATION_SUBMIT: aerVerificationSubmitTaskContent,
  NON_COMPLIANCE_APPLICATION_SUBMIT: nonComplianceSubmitTaskContent,
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE: nonComplianceInitialPenaltyNoticeTaskContent,
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_WAIT_FOR_PEER_REVIEW: nonComplianceInitialPenaltyNoticeTaskContent,
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_APPLICATION_PEER_REVIEW: nonComplianceInitialPenaltyNoticePeerReviewTaskContent,
  NON_COMPLIANCE_NOTICE_OF_INTENT: nonComplianceNoticeOfIntentTaskContent,
  NON_COMPLIANCE_NOTICE_OF_INTENT_WAIT_FOR_PEER_REVIEW: nonComplianceNoticeOfIntentTaskContent,
  NON_COMPLIANCE_NOTICE_OF_INTENT_APPLICATION_PEER_REVIEW: nonComplianceNoticeOfIntentPeerReviewTaskContent,
  NON_COMPLIANCE_CIVIL_PENALTY: nonComplianceCivilPenaltyTaskContent,
  NON_COMPLIANCE_CIVIL_PENALTY_WAIT_FOR_PEER_REVIEW: nonComplianceCivilPenaltyTaskContent,
  NON_COMPLIANCE_CIVIL_PENALTY_APPLICATION_PEER_REVIEW: nonComplianceCivilPenaltyPeerReviewTaskContent,
  NON_COMPLIANCE_FINAL_DETERMINATION: nonComplianceFinalDeterminationTaskContent,
  NEW_VERIFICATION_BODY_SYSTEM_NOTIFICATION: systemMessageNotificationTaskContent,
  VERIFICATION_BODY_NO_LONGER_AVAILABLE_SYSTEM_NOTIFICATION: systemMessageNotificationTaskContent,

  //SITE VISIT
  SITE_VISIT_APPLICATION_SUBMIT: siteVisitSubmitTaskContent,
  SITE_VISIT_WAIT_FOR_REVIEW: siteVisitWaitForReviewTaskContent,
  SITE_VISIT_APPLICATION_REVIEW: siteVisitReviewTaskContent,
  SITE_VISIT_WAIT_FOR_PEER_REVIEW: siteVisitReviewTaskContent,
  SITE_VISIT_WAIT_FOR_AMENDS: siteVisitReviewTaskContent,
  SITE_VISIT_APPLICATION_PEER_REVIEW: siteVisitPeerReviewTaskContent,
  SITE_VISIT_APPLICATION_AMENDS_SUBMIT: siteVisitAmendsTaskContent,
};
