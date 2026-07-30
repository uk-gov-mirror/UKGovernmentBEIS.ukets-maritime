import { Routes } from '@angular/router';

import { ApplicationDetailsWizardSteps } from '@requests/common/site-visit/subtasks/application-details';
import { backlinkResolver } from '@requests/common/task-navigation';
import { canActivateApplicationDetailsSummary } from '@requests/tasks/site-visit-review/subtasks/application-details/application-details.guards';

export const APPLICATION_DETAILS_ROUTES: Routes = [
  {
    path: '',
    title: 'Check your answers',
    canActivate: [canActivateApplicationDetailsSummary],
    data: { breadcrumb: false, backlink: '../../' },
    loadComponent: () =>
      import('@requests/tasks/site-visit-review/subtasks/application-details/application-details-decision-summary').then(
        (m) => m.ApplicationDetailsDecisionSummaryComponent,
      ),
  },
  {
    path: ApplicationDetailsWizardSteps.DECISION,
    title: 'Review the details of the application',
    data: { breadcrumb: false },
    resolve: {
      backlink: backlinkResolver(ApplicationDetailsWizardSteps.SUMMARY, '../../'),
    },
    loadComponent: () =>
      import('@requests/tasks/site-visit-review/subtasks/application-details/application-details-decision').then(
        (m) => m.ApplicationDetailsDecisionComponent,
      ),
  },
];
