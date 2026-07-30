import { PeerReviewDecision, SiteVisitApplicationReviewRequestTaskPayload } from '@mrtm/api';

export type SiteVisitPeerReviewPayload = SiteVisitApplicationReviewRequestTaskPayload & {
  decision?: PeerReviewDecision;
};
