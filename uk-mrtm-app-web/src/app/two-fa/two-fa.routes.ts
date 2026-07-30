import { Routes } from '@angular/router';

import { AuthGuard } from '@core/guards/auth.guard';
import { PendingRequestGuard } from '@core/guards/pending-request.guard';

export const TWO_FA_ROUTES: Routes = [
  {
    path: 'change',
    title: 'Request to change two factor authentication',
    data: { breadcrumb: true },
    canActivate: [AuthGuard],
    canDeactivate: [PendingRequestGuard],
    loadComponent: () => import('@two-fa/change-2fa/change-2fa.component').then((c) => c.Change2faComponent),
  },
  {
    path: 'invalid-code',
    title: 'Invalid code',
    data: { breadcrumb: true },
    canActivate: [AuthGuard],
    loadComponent: () => import('@two-fa/invalid-code/invalid-code.component').then((c) => c.InvalidCodeComponent),
  },
  {
    path: 'request-change',
    title: 'Request to change two factor authentication',
    data: { breadcrumb: true },
    loadComponent: () => import('@two-fa/delete-2fa/delete-2fa.component').then((c) => c.Delete2faComponent),
  },
  {
    path: 'invalid-link',
    title: 'This link is invalid',
    data: { breadcrumb: true },
    loadComponent: () => import('@invitation/invalid-link/invalid-link.component').then((c) => c.InvalidLinkComponent),
  },
  {
    path: 'request-2fa-reset',
    title: 'Request two factor authentication reset',
    data: { breadcrumb: true },
    loadComponent: () =>
      import('@two-fa/request-two-fa-reset/request-two-fa-reset.component').then((c) => c.RequestTwoFaResetComponent),
  },
  {
    path: 'reset-2fa',
    title: 'Reset two factor authentication',
    data: { breadcrumb: true },
    canActivate: [AuthGuard],
    loadComponent: () => import('@two-fa/reset-two-fa/reset-two-fa.component').then((c) => c.ResetTwoFaComponent),
  },
];
