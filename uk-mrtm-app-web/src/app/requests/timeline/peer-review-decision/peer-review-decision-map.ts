import { PeerReviewDecisionTimelineTextMap } from '@shared/types';

export const getPeerReviewDecisionTimelineTextMap = (actionType: string): PeerReviewDecisionTimelineTextMap => {
  if (
    actionType === 'NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEWER_ACCEPTED' ||
    actionType === 'NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_PEER_REVIEWER_REJECTED'
  ) {
    return {
      caption: 'Review initial penalty notice reponse',
      decision: 'Peer review decision',
      notes: 'Supporting notes',
    };
  }

  if (
    actionType === 'NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEWER_ACCEPTED' ||
    actionType === 'NON_COMPLIANCE_NOTICE_OF_INTENT_PEER_REVIEWER_REJECTED'
  ) {
    return {
      caption: 'Review notice of intent reponse',
      decision: 'Peer review decision',
      notes: 'Supporting notes',
    };
  }

  if (
    actionType === 'NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEWER_ACCEPTED' ||
    actionType === 'NON_COMPLIANCE_CIVIL_PENALTY_PEER_REVIEWER_REJECTED'
  ) {
    return {
      caption: 'Review civil penalty notice reponse',
      decision: 'Peer review decision',
      notes: 'Supporting notes',
    };
  }

  if (
    actionType === 'SITE_VISIT_APPLICATION_PEER_REVIEWER_ACCEPTED' ||
    actionType === 'SITE_VISIT_APPLICATION_PEER_REVIEWER_REJECTED'
  ) {
    return {
      caption: '',
      decision: 'Decision',
      notes: 'Notes',
    };
  }

  return {
    caption: 'Peer review response',
    decision: 'Peer review decision',
    notes: 'Supporting notes',
  };
};
