import { Routes } from '@angular/router';

import { canActivateApplicationDetailsSummary } from '@requests/common/site-visit/subtasks/application-details/application-details.guard';
import { ApplicationDetailsWizardSteps } from '@requests/common/site-visit/subtasks/application-details/application-details.helpers';
import { siteVisitSubtasksMap } from '@requests/common/site-visit/subtasks/site-visit.subtasks-map';
import { backlinkResolver } from '@requests/common/task-navigation';

export const APPLICATION_DETAILS_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: false, backlink: '../../' },
    canActivate: [canActivateApplicationDetailsSummary],
    title: siteVisitSubtasksMap.applicationDetails.title,
    loadComponent: () =>
      import('@requests/common/site-visit/subtasks/application-details/application-details-summary').then(
        (m) => m.ApplicationDetailsSummaryComponent,
      ),
  },
  {
    path: ApplicationDetailsWizardSteps.EVIDENCE,
    data: { breadcrumb: false },
    title: 'Upload evidence for a virtual site visit application',
    resolve: {
      backlink: backlinkResolver(ApplicationDetailsWizardSteps.SUMMARY, '../../'),
    },
    loadComponent: () =>
      import('@requests/common/site-visit/subtasks/application-details/application-details-evidence').then(
        (m) => m.ApplicationDetailsEvidenceComponent,
      ),
  },
];
