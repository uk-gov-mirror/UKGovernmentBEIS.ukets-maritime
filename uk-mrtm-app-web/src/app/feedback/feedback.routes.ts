import { Routes } from '@angular/router';

import { PendingRequestGuard } from '@core/guards/pending-request.guard';

export const FEEDBACK_ROUTES: Routes = [
  {
    path: '',
    title: 'Feedback',
    data: { breadcrumb: true },
    canDeactivate: [PendingRequestGuard],
    loadComponent: () => import('@feedback/feedback.component').then((c) => c.FeedbackComponent),
  },
  {
    path: 'sent',
    title: 'Feedback sent',
    data: { breadcrumb: true },
    loadComponent: () => import('@feedback/feedback-sent/feedback-sent.component').then((c) => c.FeedbackSentComponent),
  },
];
