import { Routes } from '@angular/router';

import { backlinkResolver } from '@requests/common';
import { canActivateVirReviewReportSummary } from '@requests/tasks/vir-review/subtasks/report-summary/report-summary.guard';
import { VirReviewReportSummaryWizardStep } from '@requests/tasks/vir-review/subtasks/report-summary/report-summary.helpers';
import { VirRespondToRecommendationWizardStep } from '@requests/tasks/vir-submit/subtasks/respond-to-recommendation';

export const REVIEW_REPORT_SUMMARY_ROUTES: Routes = [
  {
    path: '',
    title: 'Check your answers',
    data: { breadcrumb: false, backlink: '../../' },
    canActivate: [canActivateVirReviewReportSummary],
    loadComponent: () =>
      import('@requests/tasks/vir-review/subtasks/report-summary/report-summary').then((c) => c.ReportSummaryComponent),
  },
  {
    path: VirReviewReportSummaryWizardStep.REPORT,
    title: 'Create report summary',
    data: { breadcrumb: false },
    resolve: {
      backlink: backlinkResolver(VirRespondToRecommendationWizardStep.SUMMARY, '../../'),
    },
    loadComponent: () =>
      import('@requests/tasks/vir-review/subtasks/report-summary/report-summary-form').then(
        (c) => c.ReportSummaryFormComponent,
      ),
  },
];
