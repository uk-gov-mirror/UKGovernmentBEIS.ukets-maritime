import { Routes } from '@angular/router';

import { PayloadMutatorsHandler, SideEffectsHandler } from '@netz/common/forms';

import { APPLICATION_DETAILS_ROUTE_PATH } from '@requests/common/site-visit/subtasks/application-details';
import {
  provideTaskPayloadMutators,
  provideTaskServices,
  provideTaskSideEffects,
  provideWizardFlowManagers,
} from '@requests/tasks/site-visit-review/site-visit-review.providers';

export const SITE_VISIT_REVIEW_ROUTES: Routes = [
  {
    path: '',
    providers: [
      PayloadMutatorsHandler,
      SideEffectsHandler,
      provideTaskServices(),
      provideTaskPayloadMutators(),
      provideTaskSideEffects(),
      provideWizardFlowManagers(),
    ],
    children: [
      {
        path: 'peer-review',
        loadChildren: () =>
          import('@requests/common/components/peer-review').then((r) => r.SEND_FOR_PEER_REVIEW_ROUTES),
      },
      {
        path: 'notify-operator',
        canActivate: [],
        providers: [],
        loadChildren: () => import('@requests/common/components/notify-operator').then((r) => r.NOTIFY_OPERATOR_ROUTES),
      },
      {
        path: APPLICATION_DETAILS_ROUTE_PATH,
        loadChildren: () =>
          import('@requests/tasks/site-visit-review/subtasks/application-details/application-details.routes').then(
            (r) => r.APPLICATION_DETAILS_ROUTES,
          ),
      },
      {
        path: 'return-for-changes',
        loadChildren: () =>
          import('@requests/tasks/site-visit-review/subtasks/return-for-changes/return-for-changes.routes').then(
            (r) => r.RETURN_FOR_CHANGES_ROUTES,
          ),
      },
    ],
  },
];
