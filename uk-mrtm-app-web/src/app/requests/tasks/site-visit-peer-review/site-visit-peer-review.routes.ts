import { Routes } from '@angular/router';

import { PayloadMutatorsHandler, SideEffectsHandler } from '@netz/common/forms';

import { APPLICATION_DETAILS_ROUTE_PATH } from '@requests/common/site-visit/subtasks/application-details';
import {
  peerReviewDecisionProviders,
  provideTaskPayloadMutators,
  provideTaskServices,
  provideWizardFlowManagers,
} from '@requests/tasks/site-visit-peer-review/site-visit-peer-review.providers';

export const SITE_VISIT_PEER_REVIEW_ROUTES: Routes = [
  {
    path: '',
    providers: [
      PayloadMutatorsHandler,
      SideEffectsHandler,
      provideTaskServices(),
      provideTaskPayloadMutators(),
      provideWizardFlowManagers(),
    ],
    children: [
      {
        path: 'peer-review-decision',
        data: { breadcrumb: false, backlink: '../../' },
        providers: [peerReviewDecisionProviders],
        loadChildren: () =>
          import('@requests/common/subtasks/peer-review-decision').then((r) => r.PEER_REVIEW_DECISION_ROUTES),
      },
      {
        path: APPLICATION_DETAILS_ROUTE_PATH,
        loadChildren: () =>
          import('@requests/tasks/site-visit-review/subtasks/application-details/application-details.routes').then(
            (r) => r.APPLICATION_DETAILS_ROUTES,
          ),
      },
    ],
  },
];
