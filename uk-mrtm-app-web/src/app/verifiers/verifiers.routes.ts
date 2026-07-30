import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { PendingRequestGuard } from '@core/guards';
import { VerifierUserStore } from '@verifiers/+state/verifier-user.store';
import { addGuard, addSuccessGuard, addSummaryGuard } from '@verifiers/add';
import { DATA_SUPPLIER_ROUTE_PREFIX } from '@verifiers/components';
import { detailsGuard } from '@verifiers/details';
import { verifiersGuard } from '@verifiers/verifiers.guard';

export const VERIFIERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [verifiersGuard],
    loadComponent: () => import('@verifiers/verifiers.component').then((c) => c.VerifiersComponent),
  },
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
            loadComponent: () => import('@verifiers/delete/delete.component').then((c) => c.DeleteComponent),
          },
          {
            path: 'success',
            data: { breadcrumb: 'Dashboard' },
            loadComponent: () => import('@verifiers/delete/success/success.component').then((c) => c.SuccessComponent),
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
        data: { breadcrumb: false, backlink: '../../' },
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
  {
    path: DATA_SUPPLIER_ROUTE_PREFIX,
    loadChildren: () => import('@verifiers/components/data-supplier').then((m) => m.DATA_SUPPLIER_ROUTES),
  },
];
