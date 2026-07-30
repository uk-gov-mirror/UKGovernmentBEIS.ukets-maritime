import { Routes } from '@angular/router';

import { canActivateSuccessGuard } from '@verification-bodies/create-verification-body/success';
import { canActivateSummaryGuard } from '@verification-bodies/create-verification-body/summary';

export const CREATE_VERIFICATION_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: false, backlink: '../' },
    loadComponent: () =>
      import('@verification-bodies/create-verification-body/create-verification-body.component').then(
        (c) => c.CreateVerificationBodyComponent,
      ),
  },
  {
    path: 'summary',
    data: { breadcrumb: false, backlink: '../' },
    canActivate: [canActivateSummaryGuard],
    loadComponent: () =>
      import('@verification-bodies/create-verification-body/summary').then((c) => c.SummaryComponent),
  },
  {
    path: 'success',
    canActivate: [canActivateSuccessGuard],
    loadComponent: () =>
      import('@verification-bodies/create-verification-body/success').then((c) => c.SuccessComponent),
  },
];
