import { inject } from '@angular/core';
import { Route } from '@angular/router';

import { PendingRequestGuard } from '@core/guards';
import { VerifierUserStore } from '@verifiers/+state/verifier-user.store';
import { addGuard, addSuccessGuard, addSummaryGuard } from '@verifiers/add';
import { detailsGuard } from '@verifiers/details';

export const VERIFICATION_BODY_DETAILS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@verification-bodies/verification-body-details/verification-body-details.component').then(
        (c) => c.VerificationBodyDetailsComponent,
      ),
  },
  {
    path: 'edit',
    canDeactivate: [PendingRequestGuard],
    data: { breadcrumb: false, backlink: '../' },
    title: 'Verification body details - Edit verification body details',
    loadComponent: () => import('@verification-bodies/verification-body-details/edit').then((c) => c.EditComponent),
  },
  {
    path: 'delete',
    title: 'Verification body details - Delete verification body',
    children: [
      {
        path: '',
        data: { breadcrumb: false, backlink: '../../' },
        canDeactivate: [PendingRequestGuard],
        loadComponent: () =>
          import('@verification-bodies/verification-body-details/delete').then((c) => c.DeleteComponent),
      },
      {
        path: 'success',
        title: 'Verification body details - Delete success',
        loadComponent: () =>
          import('@verification-bodies/verification-body-details/delete').then((c) => c.SuccessComponent),
      },
    ],
  },
  {
    path: 'verifiers',
    children: [
      {
        path: ':userId',
        canActivate: [detailsGuard],
        resolve: {
          verifierUser: () => inject(VerifierUserStore).getState().currentVerifierUser,
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: (data) => `${data.verifierUser.firstName} ${data.verifierUser.lastName}`,
            },
            loadComponent: () => import('@verifiers/details').then((c) => c.DetailsComponent),
          },
          {
            path: 'edit',
            data: { breadcrumb: false, backlink: '../' },
            canDeactivate: [PendingRequestGuard],
            loadComponent: () => import('@verifiers/details').then((c) => c.EditComponent),
          },
          {
            path: 'delete',
            data: { breadcrumb: 'Manage verifier users' },
            children: [
              {
                path: '',
                data: { breadcrumb: false, backlink: '../../' },
                loadComponent: () =>
                  import('@verification-bodies/verification-body-details/delete').then((c) => c.DeleteComponent),
              },
              {
                path: 'success',
                data: { breadcrumb: 'Dashboard' },
                loadComponent: () =>
                  import('@verification-bodies/verification-body-details/delete').then((c) => c.SuccessComponent),
              },
            ],
          },
        ],
      },
      {
        path: 'add/:userType',
        canActivate: [addGuard],
        children: [
          {
            path: '',
            data: { breadcrumb: false, backlink: '../../../', backlinkFragment: 'contacts' },
            loadComponent: () => import('@verifiers/add').then((c) => c.AddComponent),
          },
          {
            path: 'summary',
            data: { breadcrumb: false, backlink: '../' },
            canActivate: [addSummaryGuard],
            canDeactivate: [PendingRequestGuard],
            loadComponent: () => import('@verifiers/add').then((c) => c.AddSummaryComponent),
          },
          {
            path: 'success',
            canActivate: [addSuccessGuard],
            loadComponent: () => import('@verifiers/add').then((c) => c.AddSuccessComponent),
          },
        ],
      },
    ],
  },
];
