import { Routes } from '@angular/router';

import { backlinkResolver } from '@requests/common/';
import { canActivatePeerReviewDecisionSummary } from '@requests/common/subtasks/peer-review-decision/peer-review-decision.guard';
import { PeerReviewWizardStep } from '@requests/common/subtasks/peer-review-decision/peer-review-decision.helper';

export const PEER_REVIEW_DECISION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [canActivatePeerReviewDecisionSummary],
    data: { breadcrumb: false, backlink: '../../' },
    loadComponent: () =>
      import('@requests/common/subtasks/peer-review-decision/peer-review-decision-summary').then(
        (c) => c.PeerReviewDecisionSummaryComponent,
      ),
  },
  {
    path: PeerReviewWizardStep.DECISION,
    resolve: { backlink: backlinkResolver(PeerReviewWizardStep.SUMMARY, '../../') },
    data: { breadcrumb: false },
    loadComponent: () =>
      import('@requests/common/subtasks/peer-review-decision/peer-review-decision').then(
        (c) => c.PeerReviewDecisionComponent,
      ),
  },
  {
    path: PeerReviewWizardStep.SUCCESS,
    data: { backlink: false },
    loadComponent: () =>
      import('@requests/common/subtasks/peer-review-decision/peer-review-decision-success').then(
        (c) => c.PeerReviewDecisionSuccessComponent,
      ),
  },
];
