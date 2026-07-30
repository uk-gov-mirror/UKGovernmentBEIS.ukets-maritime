import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { PendingRequestGuard } from '@core/guards';
import { VerificationBodiesStoreService } from '@verification-bodies/+state/verification-bodies-store.service';
import { canDeactivateCreateVerificationBodyGuard } from '@verification-bodies/create-verification-body';
import { verificationBodiesGuard } from '@verification-bodies/verification-bodies.guard';
import { verificationBodyDetailsGuard } from '@verification-bodies/verification-body-details';

export const VERIFICATION_BODIES_ROUTES: Routes = [
  {
    path: '',
    title: 'Verification Bodies',
    canActivate: [verificationBodiesGuard],
    canDeactivate: [PendingRequestGuard],
    data: { breadcrumb: 'Manage verification bodies' },
    loadComponent: () =>
      import('@verification-bodies/verification-bodies.component').then((c) => c.VerificationBodiesComponent),
  },
  {
    path: 'add',
    title: 'Verification body details - Add a verification body',
    canDeactivate: [canDeactivateCreateVerificationBodyGuard],
    loadChildren: () =>
      import('@verification-bodies/create-verification-body/create-verification-body.routes').then(
        (m) => m.CREATE_VERIFICATION_ROUTES,
      ),
  },
  {
    path: ':id',
    canActivate: [verificationBodyDetailsGuard],
    title: 'Verification body details',
    data: { breadcrumb: 'Verification body details' },
    resolve: {
      verificationBodyName: () =>
        inject(VerificationBodiesStoreService).getState().currentVerificationBody?.verificationBody?.name,
    },
    loadChildren: () =>
      import('@verification-bodies/verification-body-details/verification-body-details.routes').then(
        (m) => m.VERIFICATION_BODY_DETAILS_ROUTES,
      ),
  },
];
