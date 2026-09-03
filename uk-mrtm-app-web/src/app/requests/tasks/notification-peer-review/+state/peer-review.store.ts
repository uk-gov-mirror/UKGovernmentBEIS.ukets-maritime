import { Service } from '@angular/core';

import { produce } from 'immer';

import { SignalStore } from '@netz/common/store';

import {
  initialPeerReviewState,
  PeerReviewDecisionState,
  PeerReviewState,
} from '@requests/tasks/notification-peer-review/+state/peer-review.state';

@Service()
export class PeerReviewStore extends SignalStore<PeerReviewState> {
  constructor() {
    super(initialPeerReviewState);
  }

  setDecision(decision: PeerReviewDecisionState) {
    this.setState(
      produce(this.state, (state) => {
        state.decision = decision;
      }),
    );
  }

  setIsDecisionSubmitted(submitted: boolean) {
    this.setState(
      produce(this.state, (state) => {
        state.decision.isSubmitted = submitted;
      }),
    );
  }

  reset(): void {
    this.setState(initialPeerReviewState);
  }
}
