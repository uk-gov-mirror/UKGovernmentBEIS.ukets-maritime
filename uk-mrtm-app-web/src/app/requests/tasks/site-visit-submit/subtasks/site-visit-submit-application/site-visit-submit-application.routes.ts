import { Routes } from '@angular/router';

export const SITE_VISIT_SUBMIT_APPLICATION_ROUTES: Routes = [
  {
    path: '',
    title: 'Send application to regulator',
    data: { breadcrumb: false, backlink: '../../' },
    loadComponent: () =>
      import('./site-visit-submit-application.component').then((c) => c.SiteVisitSubmitApplicationComponent),
  },
  {
    path: 'success',
    title: 'Application sent to regulator',
    data: { breadcrumb: 'Dashboard', backlink: false },
    loadComponent: () =>
      import('./site-visit-submit-application-success').then((c) => c.SiteVisitSubmitApplicationSuccessComponent),
  },
];
