import { Routes } from '@angular/router';

import { PayloadMutatorsHandler, SideEffectsHandler } from '@netz/common/forms';

import { APPLICATION_DETAILS_ROUTE_PATH } from '@requests/common/site-visit/subtasks/application-details';
import { canActivateSiteVisitAmendsSubmit } from '@requests/tasks/site-visit-amends/site-visit-amends.guard';
import {
  provideTaskPayloadMutators,
  provideTaskServices,
  provideTaskSideEffects,
  provideWizardFlowManagers,
} from '@requests/tasks/site-visit-amends/site-visit-amends.providers';
import { REQUESTED_CHANGES_ROUTE_PATH } from '@requests/tasks/site-visit-amends/subtasks/requested-changes';

export const SITE_VISIT_AMENDS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      PayloadMutatorsHandler,
      SideEffectsHandler,
      provideWizardFlowManagers(),
      provideTaskServices(),
      provideTaskPayloadMutators(),
      provideTaskSideEffects(),
    ],
    children: [
      {
        path: APPLICATION_DETAILS_ROUTE_PATH,
        loadChildren: () =>
          import('@requests/common/site-visit/subtasks/application-details').then((m) => m.APPLICATION_DETAILS_ROUTES),
      },
      {
        path: REQUESTED_CHANGES_ROUTE_PATH,
        loadChildren: () =>
          import('@requests/tasks/site-visit-amends/subtasks/requested-changes').then((m) => m.REQUEST_CHANGES_ROUTES),
      },
      {
        path: 'submit',
        canActivate: [canActivateSiteVisitAmendsSubmit],
        loadChildren: () =>
          import('@requests/tasks/site-visit-amends/subtasks/site-visit-amends-submit-application').then(
            (m) => m.SITE_VISIT_AMENDS_SUBMIT_APPLICATION_ROUTES,
          ),
      },
    ],
  },
];
