import { Routes } from '@angular/router';

import { PayloadMutatorsHandler, SideEffectsHandler } from '@netz/common/forms';

import { APPLICATION_DETAILS_ROUTE_PATH } from '@requests/common/site-visit/subtasks/application-details';
import { canActivateSiteVisitSubmit } from '@requests/tasks/site-visit-submit/site-visit-submit.guard';
import {
  provideTaskPayloadMutators,
  provideTaskServices,
  provideTaskSideEffects,
  provideWizardFlowManagers,
} from '@requests/tasks/site-visit-submit/site-visit-submit.providers';

export const SITE_VISIT_SUBMIT_ROUTES: Routes = [
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
        path: 'submit',
        canActivate: [canActivateSiteVisitSubmit],
        loadChildren: () =>
          import('@requests/tasks/site-visit-submit/subtasks/site-visit-submit-application').then(
            (m) => m.SITE_VISIT_SUBMIT_APPLICATION_ROUTES,
          ),
      },
    ],
  },
];
