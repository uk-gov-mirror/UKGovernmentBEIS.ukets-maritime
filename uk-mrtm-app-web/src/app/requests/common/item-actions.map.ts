import { MrtmRequestActionType } from '@shared/types';

export const itemActionsMap: Record<
  MrtmRequestActionType,
  { text: string; transformed: boolean; linkable: boolean; suffix?: string }
> = {
  EMP_ISSUANCE_APPLICATION_SUBMITTED: {
    text: 'Apply for an emissions monitoring plan submitted',
    transformed: true,
    linkable: true,
  },
  EMP_NOTIFICATION_APPLICATION_SUBMITTED: { text: 'Notification submitted', transformed: true, linkable: true },
  EMP_NOTIFICATION_FOLLOW_UP_RESPONSE_SUBMITTED: {
    text: 'Follow up response submitted',
    transformed: true,
    linkable: true,
  },
  EMP_NOTIFICATION_APPLICATION_GRANTED: { text: 'EMP Notification approved', transformed: true, linkable: true },
  EMP_NOTIFICATION_APPLICATION_REJECTED: { text: 'EMP Notification rejected', transformed: true, linkable: true },
  EMP_NOTIFICATION_PEER_REVIEW_REQUESTED: { text: 'Peer review requested', transformed: true, linkable: false },
  EMP_NOTIFICATION_APPLICATION_PEER_REVIEWER_ACCEPTED: {
    text: 'Peer review agreement submitted',
    transformed: true,
    linkable: true,
  },
  EMP_NOTIFICATION_APPLICATION_PEER_REVIEWER_REJECTED: {
    text: 'Peer review disagreement submitted',
    transformed: true,
    linkable: true,
  },
  EMP_NOTIFICATION_FOLLOW_UP_DATE_EXTENDED: {
    text: 'Follow up response due date updated',
    transformed: true,
    linkable: false,
  },
  EMP_NOTIFICATION_FOLLOW_UP_RETURNED_FOR_AMENDS: {
    text: 'Follow up response returned for amends',
    transformed: true,
    linkable: true,
  },
  EMP_NOTIFICATION_FOLLOW_UP_RECALLED_FROM_AMENDS: {
    text: 'Follow up response recalled',
    transformed: true,
    linkable: false,
  },
  EMP_NOTIFICATION_FOLLOW_UP_APPLICATION_AMENDS_SUBMITTED: {
    text: 'Amended follow up response submitted',
    transformed: true,
    linkable: false,
  },
  EMP_NOTIFICATION_APPLICATION_COMPLETED: { text: 'EMP Notification completed', transformed: true, linkable: true },
  EMP_NOTIFICATION_APPLICATION_CANCELLED: { text: 'Notification cancelled', transformed: false, linkable: false },
  EMP_ISSUANCE_APPLICATION_APPROVED: {
    text: 'Apply for an emissions monitoring plan approved',
    transformed: true,
    linkable: true,
  },
  EMP_ISSUANCE_APPLICATION_DEEMED_WITHDRAWN: {
    text: 'Apply for an emissions monitoring plan withdrawn',
    transformed: true,
    linkable: true,
  },
  EMP_ISSUANCE_RECALLED_FROM_AMENDS: {
    text: 'Apply for an emissions monitoring plan recalled',
    transformed: true,
    linkable: false,
  },
  EMP_ISSUANCE_APPLICATION_RETURNED_FOR_AMENDS: {
    text: 'Apply for an emission monitoring plan returned to operator for amends',
    transformed: true,
    linkable: true,
  },
  EMP_ISSUANCE_APPLICATION_AMENDS_SUBMITTED: {
    text: 'Apply for an emission monitoring plan amends submitted',
    transformed: true,
    linkable: true,
  },
  EMP_ISSUANCE_PEER_REVIEW_REQUESTED: {
    text: 'Peer review requested',
    transformed: true,
    linkable: false,
  },
  EMP_ISSUANCE_APPLICATION_PEER_REVIEWER_ACCEPTED: {
    text: 'Peer review agreement submitted',
    transformed: true,
    linkable: true,
  },
  EMP_ISSUANCE_APPLICATION_PEER_REVIEWER_REJECTED: {
    text: 'Peer review disagreement submitted',
    transformed: true,
    linkable: true,
  },
  EMP_VARIATION_RECALLED_FROM_AMENDS: {
    text: 'Recalled',
    transformed: true,
    linkable: false,
  },
  EMP_VARIATION_APPLICATION_REGULATOR_LED_APPROVED: {
    text: 'Approved',
    transformed: true,
    linkable: true,
  },
  EMP_VARIATION_APPLICATION_CANCELLED: {
    text: 'Cancelled',
    transformed: true,
    linkable: false,
  },
  EMP_VARIATION_APPLICATION_SUBMITTED: {
    text: 'Submitted',
    transformed: true,
    linkable: true,
  },
  EMP_VARIATION_APPLICATION_APPROVED: {
    text: 'Approved',
    transformed: true,
    linkable: true,
  },
  EMP_VARIATION_APPLICATION_REJECTED: {
    text: 'Rejected',
    transformed: true,
    linkable: true,
  },
  EMP_VARIATION_APPLICATION_DEEMED_WITHDRAWN: {
    text: 'Withdrawn',
    transformed: true,
    linkable: true,
  },
  EMP_VARIATION_APPLICATION_RETURNED_FOR_AMENDS: {
    text: 'Returned to operator for amends',
    transformed: true,
    linkable: true,
  },
  EMP_VARIATION_APPLICATION_AMENDS_SUBMITTED: {
    text: 'Amends submitted',
    transformed: true,
    linkable: true,
  },
  EMP_VARIATION_PEER_REVIEW_REQUESTED: {
    text: 'Peer review requested',
    transformed: true,
    linkable: false,
  },
  EMP_VARIATION_APPLICATION_PEER_REVIEWER_ACCEPTED: {
    text: 'Peer review agreement submitted',
    transformed: true,
    linkable: true,
  },
  EMP_VARIATION_APPLICATION_PEER_REVIEWER_REJECTED: {
    text: 'Peer review disagreement submitted',
    transformed: true,
    linkable: true,
  },
  RFI_SUBMITTED: {
    text: 'Official request for information sent',
    transformed: true,
    linkable: true,
  },
  RFI_RESPONSE_SUBMITTED: {
    text: 'Official request for information responded',
    transformed: true,
    linkable: true,
  },
  RFI_CANCELLED: {
    text: 'Official request for information withdrawn',
    transformed: true,
    linkable: false,
  },
  RFI_EXPIRED: {
    text: 'Official request for information expired',
    transformed: false,
    linkable: false,
  },
  ACCOUNT_CLOSURE_SUBMITTED: {
    text: 'Account closed',
    transformed: true,
    linkable: true,
  },
  ACCOUNT_CLOSURE_CANCELLED: {
    text: 'Account closure cancelled',
    transformed: true,
    linkable: false,
  },
  RDE_SUBMITTED: {
    text: 'Deadline extension date requested',
    transformed: true,
    linkable: true,
  },
  RDE_ACCEPTED: {
    text: 'Deadline extension date accepted',
    transformed: true,
    linkable: false,
  },
  RDE_REJECTED: {
    text: 'Deadline extension date rejected',
    transformed: true,
    linkable: true,
  },
  RDE_FORCE_ACCEPTED: {
    text: 'Deadline extension date approved',
    transformed: true,
    linkable: true,
  },
  RDE_FORCE_REJECTED: {
    text: 'Deadline extension date rejected',
    transformed: true,
    linkable: true,
  },
  RDE_EXPIRED: {
    text: 'Deadline extension date expired',
    transformed: false,
    linkable: false,
  },
  EMP_REISSUE_COMPLETED: {
    text: 'Batch variation completed',
    transformed: true,
    linkable: true,
  },
  EMP_BATCH_REISSUE_COMPLETED: {
    text: 'Batch variation completed',
    transformed: true,
    linkable: true,
  },
  EMP_BATCH_REISSUE_SUBMITTED: {
    text: 'Batch variation submitted',
    transformed: true,
    linkable: true,
  },
  DOE_PEER_REVIEW_REQUESTED: {
    text: 'Peer review annual emissions determination requested',
    transformed: true,
    linkable: false,
  },
  DOE_PEER_REVIEWER_ACCEPTED: {
    text: 'Peer review annual emissions determination agreement submitted',
    transformed: true,
    linkable: true,
  },
  DOE_PEER_REVIEWER_REJECTED: {
    text: 'Peer review annual emissions determination disagreement submitted',
    transformed: true,
    linkable: true,
  },
  DOE_APPLICATION_CANCELLED: {
    text: 'Determine annual emissions cancelled',
    transformed: true,
    linkable: false,
  },
  DOE_APPLICATION_SUBMITTED: {
    text: 'Determine annual emissions submitted',
    transformed: true,
    linkable: true,
  },
  EMP_ISSUANCE_REGISTRY_ACCOUNT_OPENING_EVENT_SUBMITTED: {
    text: 'Sent information to the registry',
    transformed: true,
    linkable: true,
  },
  REGISTRY_UPDATED_EMISSIONS_EVENT_SUBMITTED: {
    text: 'Emissions figure for surrender sent to Registry',
    transformed: true,
    linkable: true,
  },
  REGISTRY_UPDATED_ACCOUNT_EVENT_SUBMITTED: {
    text: 'Sent information to the registry by system',
    transformed: false,
    linkable: true,
  },
  AER_APPLICATION_CANCELLED_DUE_TO_EXEMPT: {
    text: 'Complete annual emissions report cancelled due to exempt reporting status',
    transformed: false,
    linkable: false,
  },
  AER_APPLICATION_SUBMITTED: {
    text: 'Complete annual emissions report submitted to regulator',
    transformed: true,
    linkable: true,
  },
  AER_APPLICATION_SENT_TO_VERIFIER: {
    text: 'Complete annual emissions report submitted to verifier',
    transformed: true,
    linkable: true,
  },
  AER_APPLICATION_VERIFICATION_SUBMITTED: {
    text: 'Verify annual emissions report submitted to operator',
    transformed: true,
    linkable: true,
  },
  AER_RECALLED_FROM_VERIFICATION: {
    text: 'Complete annual emissions report recalled from verifier',
    transformed: true,
    linkable: false,
  },
  AER_VERIFICATION_RETURNED_TO_OPERATOR: {
    text: 'Verifier returned to operator for changes',
    transformed: true,
    linkable: true,
  },
  VERIFICATION_STATEMENT_CANCELLED: {
    text: 'Verify annual emissions report cancelled due to a change of verification body',
    transformed: false,
    linkable: false,
  },
  VIR_APPLICATION_SUBMITTED: {
    text: 'Verifier improvement report submitted',
    transformed: true,
    linkable: true,
  },
  VIR_APPLICATION_REVIEWED: {
    text: 'Verifier improvement report decision submitted',
    transformed: true,
    linkable: true,
  },
  VIR_APPLICATION_RESPONDED_TO_REGULATOR_COMMENTS: {
    text: 'Follow-up response submitted',
    transformed: true,
    linkable: true,
  },
  PAYMENT_MARKED_AS_PAID: {
    text: 'Payment marked as paid',
    transformed: true,
    linkable: true,
    suffix: '(BACS)',
  },
  PAYMENT_MARKED_AS_RECEIVED: {
    text: 'Payment marked as received',
    transformed: true,
    linkable: true,
  },
  PAYMENT_CANCELLED: {
    text: 'Payment task cancelled',
    transformed: true,
    linkable: true,
  },
  PAYMENT_COMPLETED: {
    text: 'Payment confirmed via GOV.UK pay',
    transformed: false,
    linkable: true,
  },
  NON_COMPLIANCE_APPLICATION_SUBMITTED: {
    text: 'Non-compliance details submitted',
    transformed: true,
    linkable: true,
  },
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEW_REQUESTED: {
    text: 'Peer review of initial penalty notice requested',
    transformed: true,
    linkable: false,
  },
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEWER_ACCEPTED: {
    text: 'Peer review agreement for initial penalty submitted',
    transformed: true,
    linkable: true,
  },
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEWER_REJECTED: {
    text: 'Peer review disagreement for initial penalty submitted',
    transformed: true,
    linkable: true,
  },
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_APPLICATION_SUBMITTED: {
    text: 'Initial penalty notice sent to operator',
    transformed: true,
    linkable: true,
  },
  DOE_APPLICATION_CANCELLED_DUE_TO_EXEMPT: {
    text: 'Determine annual emissions cancelled due to exempt reporting status',
    transformed: false,
    linkable: false,
  },
  AER_APPLICATION_EXEMPTION_REVERTED: {
    text: 'Complete annual emissions report re-initiated after exemption',
    transformed: false,
    linkable: false,
  },
  AER_APPLICATION_RE_INITIATED: {
    text: 'Complete annual emissions report returned for amends to operator',
    transformed: true,
    linkable: false,
  },
  NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEW_REQUESTED: {
    text: 'Peer review of notice of intent requested',
    transformed: true,
    linkable: false,
  },
  NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEWER_ACCEPTED: {
    text: 'Peer review agreement for notice of intent submitted',
    transformed: true,
    linkable: true,
  },
  NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEWER_REJECTED: {
    text: 'Peer review disagreement for notice of intent submitted',
    transformed: true,
    linkable: true,
  },
  NON_COMPLIANCE_NOTICE_OF_INTENT_APPLICATION_SUBMITTED: {
    text: 'Notice of intent sent to operator',
    transformed: true,
    linkable: true,
  },
  AER_APPLICATION_REVIEW_SKIPPED: {
    text: 'Complete annual emissions report completed without review',
    transformed: true,
    linkable: true,
  },
  AER_APPLICATION_COMPLETED: {
    text: 'Complete annual emissions report reviewed',
    transformed: true,
    linkable: true,
  },
  AER_APPLICATION_RETURNED_FOR_AMENDS: {
    text: 'Complete annual emissions report returned for amends to operator',
    transformed: true,
    linkable: true,
  },
  AER_APPLICATION_AMENDS_SUBMITTED: {
    text: 'Complete annual emissions report amends submitted to regulator',
    transformed: true,
    linkable: true,
  },
  AER_APPLICATION_AMENDS_SENT_TO_VERIFIER: {
    text: 'Complete annual emissions report amends submitted to verifier',
    transformed: true,
    linkable: true,
  },
  REQUEST_TERMINATED: {
    text: 'Workflow terminated by the system',
    transformed: false,
    linkable: false,
  },
  NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEW_REQUESTED: {
    text: 'Peer review of civil penalty notice requested',
    transformed: true,
    linkable: false,
  },
  NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEWER_ACCEPTED: {
    text: 'Peer review agreement for civil penalty notice submitted',
    transformed: true,
    linkable: true,
  },
  NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEWER_REJECTED: {
    text: 'Peer review disagreement for civil penalty notice submitted',
    transformed: true,
    linkable: true,
  },
  NON_COMPLIANCE_CIVIL_PENALTY_APPLICATION_SUBMITTED: {
    text: 'Civil penalty notice sent to operator',
    transformed: true,
    linkable: true,
  },
  NON_COMPLIANCE_FINAL_DETERMINATION_APPLICATION_SUBMITTED: {
    text: 'Conclusion provided',
    transformed: true,
    linkable: true,
  },
  NON_COMPLIANCE_APPLICATION_CLOSED: {
    text: 'Non-compliance closed',
    transformed: true,
    linkable: true,
  },
  NON_COMPLIANCE_DETAILS_AMENDED: {
    text: 'Non-compliance details updated',
    transformed: true,
    linkable: true,
  },
  REGISTRY_REGULATOR_NOTICE_EVENT_SUBMITTED: {
    text: 'Sent information to the registry by system',
    transformed: false,
    linkable: true,
  },

  /**
   * SITE_VISIT
   */
  SITE_VISIT_APPLICATION_SUBMITTED: {
    text: 'Virtual site visit application for annual submitted',
    transformed: true,
    linkable: true,
  },
  SITE_VISIT_APPLICATION_RETURNED_FOR_AMENDS: {
    text: 'Virtual site visit application for annual returned to operator for amends',
    transformed: true,
    linkable: true,
  },
  SITE_VISIT_APPLICATION_AMENDS_SUBMITTED: {
    text: 'Virtual site visit application amends for annual submitted',
    transformed: true,
    linkable: true,
  },
  SITE_VISIT_PEER_REVIEW_REQUESTED: {
    text: 'Peer review requested',
    transformed: true,
    linkable: false,
  },
  SITE_VISIT_APPLICATION_PEER_REVIEWER_ACCEPTED: {
    text: 'Peer review agreement submitted',
    transformed: true,
    linkable: true,
  },
  SITE_VISIT_APPLICATION_PEER_REVIEWER_REJECTED: {
    text: 'Peer review disagreement submitted',
    transformed: true,
    linkable: true,
  },
  SITE_VISIT_APPLICATION_APPROVED: {
    text: 'Virtual site visit application for annual accepted',
    transformed: true,
    linkable: true,
  },
  SITE_VISIT_APPLICATION_REJECTED: {
    text: 'Virtual site visit application for annual rejected',
    transformed: true,
    linkable: true,
  },
  SITE_VISIT_RECALLED_FROM_AMENDS: {
    text: 'Virtual site visit application for annual recalled',
    transformed: true,
    linkable: false,
  },
  SITE_VISIT_APPLICATION_CANCELLED: {
    text: 'Virtual site visit application for annual cancelled',
    transformed: true,
    linkable: false,
  },
};
