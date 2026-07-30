import { Routes } from '@angular/router';

export const SITE_VISIT_AMENDS_SUBMIT_APPLICATION_ROUTES: Routes = [
  {
    path: '',
    title: 'Send application to regulator',
    data: { breadcrumb: false, backlink: '../../' },
    loadComponent: () =>
      import('./site-visit-amends-submit-application.component').then(
        (c) => c.SiteVisitAmendsSubmitApplicationComponent,
      ),
  },
  {
    path: 'success',
    title: 'Application sent back to regulator',
    data: { breadcrumb: 'Dashboard', backlink: false },
    loadComponent: () =>
      import('./site-visit-amends-submit-application-success').then(
        (c) => c.SiteVisitAmendsSubmitApplicationSuccessComponent,
      ),
  },
];
