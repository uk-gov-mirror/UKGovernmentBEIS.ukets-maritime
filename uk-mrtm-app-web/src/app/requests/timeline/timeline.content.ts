import { RequestActionPageContentFactoryMap } from '@netz/common/request-action';

import { accountClosureSubmittedTaskContent } from '@requests/timeline/account-closure-submitted/account-closure-submitted-task-content';
import { aerReturnedForAmendsTaskContent } from '@requests/timeline/aer-returned-for-amends/aer-returned-for-amends-task-content';
import { aerReviewSkippedTaskContent } from '@requests/timeline/aer-review-skipped/aer-review-skipped-task-content';
import { aerReviewedTaskContent } from '@requests/timeline/aer-reviewed';
import { aerSubmittedTaskContent } from '@requests/timeline/aer-submitted/aer-submitted-task-content';
import { aerVerificationReturnedToOperatorTaskContent } from '@requests/timeline/aer-verification-returned-to-operator';
import { aerVerificationSubmittedTaskContent } from '@requests/timeline/aer-verification-submitted/aer-verification-submitted-task-content';
import { doeSubmittedTaskContent } from '@requests/timeline/doe-submitted/doe-submitted-task-content';
import { empBatchReissueTaskContent } from '@requests/timeline/emp-batch-reissue';
import { empPeerReviewDecisionTaskContent } from '@requests/timeline/emp-peer-review-decision';
import { empReturnedForAmendsTaskContent } from '@requests/timeline/emp-returned-for-amends';
import { empReviewedTaskContent } from '@requests/timeline/emp-reviewed';
import { empSubmittedTaskContent } from '@requests/timeline/emp-submitted/emp-submitted-task-content';
import { empVariationRegulatorApprovedTaskContent } from '@requests/timeline/emp-variation-regulator-approved/emp-variation-regulator-approved-task-content';
import { empVariationReturnedForAmendsTaskContent } from '@requests/timeline/emp-variation-returned-for-amends/emp-variation-returned-for-amends-task-content';
import { empVariationReviewedTaskContent } from '@requests/timeline/emp-variation-reviewed';
import { empVariationSubmittedTaskContent } from '@requests/timeline/emp-variation-submitted/emp-variation-submitted-task-content';
import { followUpResponseSubmittedTaskContent } from '@requests/timeline/follow-up-response-submitted/follow-up-response-submitted-task-content';
import { followUpReturnedForAmendsTaskContent } from '@requests/timeline/follow-up-returned-for-amends/follow-up-returned-for-amends-task-content';
import { nonComplianceCivilPenaltySubmittedTaskContent } from '@requests/timeline/non-compliance-civil-penalty-submitted/non-compliance-civil-penalty-submitted-task-content';
import { nonComplianceClosedTaskContent } from '@requests/timeline/non-compliance-closed/non-compliance-closed-task-content';
import { nonComplianceDetailsAmendedTaskContent } from '@requests/timeline/non-compliance-details-amended/non-compliance-details-amended-task-content';
import { nonComplianceFinalDeterminationSubmittedTaskContent } from '@requests/timeline/non-compliance-final-determination-submitted/non-compliance-final-determination-submitted-task-content';
import { nonComplianceInitialPenaltyNoticeSubmittedTaskContent } from '@requests/timeline/non-compliance-initial-penalty-notice-submitted/non-compliance-initial-penalty-notice-submitted-task-content';
import { nonComplianceNoticeOfIntentSubmittedTaskContent } from '@requests/timeline/non-compliance-notice-of-intent-submitted/non-compliance-notice-of-intent-submitted-task-content';
import { nonComplianceSubmittedTaskContent } from '@requests/timeline/non-compliance-submitted/non-compliance-submitted-task-content';
import { notificationCompletedTaskContent } from '@requests/timeline/notification-completed/notification-completed-task-content';
import { notificationDecisionTaskContent } from '@requests/timeline/notification-decision/notification-decision-task-content';
import { notificationSubmittedTaskContent } from '@requests/timeline/notification-submitted/notification-submitted-task-content';
import { paymentTaskContent } from '@requests/timeline/payment';
import { peerReviewDecisionTaskContent } from '@requests/timeline/peer-review-decision/peer-review-decision-task-content';
import { rdeRegulatorDecisionTaskContent } from '@requests/timeline/rde-regulator-decision/rde-regulator-decision-task-content';
import { rdeRejectedTaskContent } from '@requests/timeline/rde-rejected/rde-rejected-task-content';
import { rdeSubmittedTaskContent } from '@requests/timeline/rde-submitted/rde-submitted-task-content';
import { registryAccountUpdatedTaskContent } from '@requests/timeline/registry-account-updated/registry-account-updated.task-content';
import { registryEmissionsUpdatedTaskContent } from '@requests/timeline/registry-emissions-updated/registry-emissions-updated-task-content';
import { registryNoticeEventSubmittedTaskContent } from '@requests/timeline/registry-notice-event-submitted/registry-notice-event-submitted-task-content';
import { registrySubmittedTaskContent } from '@requests/timeline/registry-submitted/registry-submitted-task-content';
import { rfiResponseTaskContent } from '@requests/timeline/rfi-response/rfi-response-task-content';
import { rfiSubmittedTaskContent } from '@requests/timeline/rfi-submitted/rfi-submitted-task-content';
import { siteVisitReturnedForAmendsTaskContent } from '@requests/timeline/site-visit-returned-for-amends';
import { siteVisitReviewedTaskContent } from '@requests/timeline/site-visit-reviewed';
import { siteVisitSubmittedTaskContent } from '@requests/timeline/site-visit-submitted';
import { virFollowUpTaskContent } from '@requests/timeline/vir-follow-up';
import { virReviewedTaskContent } from '@requests/timeline/vir-reviewed';
import { virSubmittedTaskContent } from '@requests/timeline/vir-submitted';

export const timelineContent: RequestActionPageContentFactoryMap = {
  EMP_ISSUANCE_APPLICATION_SUBMITTED: empSubmittedTaskContent,
  EMP_NOTIFICATION_APPLICATION_SUBMITTED: notificationSubmittedTaskContent,
  EMP_NOTIFICATION_APPLICATION_GRANTED: notificationDecisionTaskContent,
  EMP_NOTIFICATION_APPLICATION_REJECTED: notificationDecisionTaskContent,
  EMP_ISSUANCE_APPLICATION_APPROVED: empReviewedTaskContent,
  EMP_ISSUANCE_APPLICATION_DEEMED_WITHDRAWN: empReviewedTaskContent,
  EMP_NOTIFICATION_APPLICATION_PEER_REVIEWER_ACCEPTED: peerReviewDecisionTaskContent,
  EMP_NOTIFICATION_APPLICATION_PEER_REVIEWER_REJECTED: peerReviewDecisionTaskContent,
  EMP_NOTIFICATION_FOLLOW_UP_RESPONSE_SUBMITTED: followUpResponseSubmittedTaskContent,
  EMP_NOTIFICATION_FOLLOW_UP_RETURNED_FOR_AMENDS: followUpReturnedForAmendsTaskContent,
  EMP_NOTIFICATION_APPLICATION_COMPLETED: notificationCompletedTaskContent,
  EMP_ISSUANCE_APPLICATION_RETURNED_FOR_AMENDS: empReturnedForAmendsTaskContent,
  EMP_ISSUANCE_APPLICATION_AMENDS_SUBMITTED: empSubmittedTaskContent,
  EMP_ISSUANCE_APPLICATION_PEER_REVIEWER_ACCEPTED: empPeerReviewDecisionTaskContent,
  EMP_ISSUANCE_APPLICATION_PEER_REVIEWER_REJECTED: empPeerReviewDecisionTaskContent,
  EMP_VARIATION_APPLICATION_PEER_REVIEWER_ACCEPTED: empPeerReviewDecisionTaskContent,
  EMP_VARIATION_APPLICATION_PEER_REVIEWER_REJECTED: empPeerReviewDecisionTaskContent,
  EMP_VARIATION_APPLICATION_REGULATOR_LED_APPROVED: empVariationRegulatorApprovedTaskContent,
  EMP_VARIATION_APPLICATION_SUBMITTED: empVariationSubmittedTaskContent,
  EMP_VARIATION_APPLICATION_APPROVED: empVariationReviewedTaskContent,
  EMP_VARIATION_APPLICATION_REJECTED: empVariationReviewedTaskContent,
  EMP_VARIATION_APPLICATION_DEEMED_WITHDRAWN: empVariationReviewedTaskContent,
  EMP_VARIATION_APPLICATION_RETURNED_FOR_AMENDS: empVariationReturnedForAmendsTaskContent,
  EMP_VARIATION_APPLICATION_AMENDS_SUBMITTED: empVariationSubmittedTaskContent,
  ACCOUNT_CLOSURE_SUBMITTED: accountClosureSubmittedTaskContent,
  RDE_SUBMITTED: rdeSubmittedTaskContent,
  RDE_REJECTED: rdeRejectedTaskContent,
  RDE_FORCE_ACCEPTED: rdeRegulatorDecisionTaskContent,
  RDE_FORCE_REJECTED: rdeRegulatorDecisionTaskContent,
  RFI_SUBMITTED: rfiSubmittedTaskContent,
  RFI_RESPONSE_SUBMITTED: rfiResponseTaskContent,
  EMP_REISSUE_SUBMITTED: empBatchReissueTaskContent,
  EMP_REISSUE_COMPLETED: empBatchReissueTaskContent,
  EMP_BATCH_REISSUE_COMPLETED: empBatchReissueTaskContent,
  EMP_BATCH_REISSUE_SUBMITTED: empBatchReissueTaskContent,
  DOE_PEER_REVIEWER_REJECTED: peerReviewDecisionTaskContent,
  DOE_PEER_REVIEWER_ACCEPTED: peerReviewDecisionTaskContent,
  DOE_APPLICATION_SUBMITTED: doeSubmittedTaskContent,
  EMP_ISSUANCE_REGISTRY_ACCOUNT_OPENING_EVENT_SUBMITTED: registrySubmittedTaskContent,
  REGISTRY_UPDATED_EMISSIONS_EVENT_SUBMITTED: registryEmissionsUpdatedTaskContent,
  REGISTRY_UPDATED_ACCOUNT_EVENT_SUBMITTED: registryAccountUpdatedTaskContent,
  AER_APPLICATION_SUBMITTED: aerSubmittedTaskContent,
  AER_APPLICATION_SENT_TO_VERIFIER: aerSubmittedTaskContent,
  AER_APPLICATION_VERIFICATION_SUBMITTED: aerVerificationSubmittedTaskContent,
  AER_VERIFICATION_RETURNED_TO_OPERATOR: aerVerificationReturnedToOperatorTaskContent,
  PAYMENT_MARKED_AS_PAID: paymentTaskContent,
  PAYMENT_CANCELLED: paymentTaskContent,
  PAYMENT_MARKED_AS_RECEIVED: paymentTaskContent,
  PAYMENT_COMPLETED: paymentTaskContent,
  VIR_APPLICATION_SUBMITTED: virSubmittedTaskContent(),
  VIR_APPLICATION_REVIEWED: virReviewedTaskContent,
  VIR_APPLICATION_RESPONDED_TO_REGULATOR_COMMENTS: virFollowUpTaskContent,
  NON_COMPLIANCE_APPLICATION_SUBMITTED: nonComplianceSubmittedTaskContent,
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEWER_ACCEPTED: peerReviewDecisionTaskContent,
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEWER_REJECTED: peerReviewDecisionTaskContent,
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_APPLICATION_SUBMITTED: nonComplianceInitialPenaltyNoticeSubmittedTaskContent,
  NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEWER_ACCEPTED: peerReviewDecisionTaskContent,
  NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEWER_REJECTED: peerReviewDecisionTaskContent,
  NON_COMPLIANCE_NOTICE_OF_INTENT_APPLICATION_SUBMITTED: nonComplianceNoticeOfIntentSubmittedTaskContent,
  AER_APPLICATION_REVIEW_SKIPPED: aerReviewSkippedTaskContent,
  AER_APPLICATION_AMENDS_SUBMITTED: aerSubmittedTaskContent,
  AER_APPLICATION_AMENDS_SENT_TO_VERIFIER: aerSubmittedTaskContent,
  AER_APPLICATION_COMPLETED: aerReviewedTaskContent,
  NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEWER_ACCEPTED: peerReviewDecisionTaskContent,
  NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEWER_REJECTED: peerReviewDecisionTaskContent,
  NON_COMPLIANCE_CIVIL_PENALTY_APPLICATION_SUBMITTED: nonComplianceCivilPenaltySubmittedTaskContent,
  NON_COMPLIANCE_FINAL_DETERMINATION_APPLICATION_SUBMITTED: nonComplianceFinalDeterminationSubmittedTaskContent,
  NON_COMPLIANCE_APPLICATION_CLOSED: nonComplianceClosedTaskContent,
  AER_APPLICATION_RETURNED_FOR_AMENDS: aerReturnedForAmendsTaskContent,
  NON_COMPLIANCE_DETAILS_AMENDED: nonComplianceDetailsAmendedTaskContent,
  REGISTRY_REGULATOR_NOTICE_EVENT_SUBMITTED: registryNoticeEventSubmittedTaskContent,

  //SITE_VISIT
  SITE_VISIT_APPLICATION_SUBMITTED: siteVisitSubmittedTaskContent,
  SITE_VISIT_APPLICATION_AMENDS_SUBMITTED: siteVisitSubmittedTaskContent,
  SITE_VISIT_APPLICATION_PEER_REVIEWER_ACCEPTED: peerReviewDecisionTaskContent,
  SITE_VISIT_APPLICATION_PEER_REVIEWER_REJECTED: peerReviewDecisionTaskContent,
  SITE_VISIT_APPLICATION_RETURNED_FOR_AMENDS: siteVisitReturnedForAmendsTaskContent,
  SITE_VISIT_APPLICATION_APPROVED: siteVisitReviewedTaskContent,
  SITE_VISIT_APPLICATION_REJECTED: siteVisitReviewedTaskContent,
};
