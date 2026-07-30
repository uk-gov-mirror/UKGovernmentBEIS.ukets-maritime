import { Routes } from '@angular/router';

import { PendingRequestGuard } from '@core/guards/pending-request.guard';
import { DeleteResolver } from '@regulators/delete/delete.resolver';
import { detailsResolver } from '@regulators/details/details.resolver';
import { permissionsResolver } from '@regulators/details/permissions.resolver';
import { RegulatorsGuard } from '@regulators/regulators.guard';

export const REGULATORS_ROUTES: Routes = [
  {
    path: '',
    title: 'Regulator users',
    resolve: { regulators: RegulatorsGuard },
    canDeactivate: [PendingRequestGuard],
    loadComponent: () => import('@regulators/regulators.component').then((c) => c.RegulatorsComponent),
  },
  {
    path: 'add',
    title: 'Add a new user',
    data: { breadcrumb: true },
    canDeactivate: [PendingRequestGuard],
    loadComponent: () => import('@regulators/details/details.component').then((c) => c.DetailsComponent),
  },
  {
    path: ':userId',
    children: [
      {
        path: '',
        title: 'User details',
        data: { breadcrumb: ({ user }) => `${user.firstName} ${user.lastName}` },
        pathMatch: 'full',
        resolve: {
          user: detailsResolver,
          permissions: permissionsResolver,
        },
        canDeactivate: [PendingRequestGuard],
        loadComponent: () => import('@regulators/details/details.component').then((c) => c.DetailsComponent),
      },
      {
        path: 'delete',
        title: 'Confirm that this user account will be deleted',
        data: { breadcrumb: ({ user }) => `Delete ${user.firstName} ${user.lastName}` },
        resolve: { user: DeleteResolver },
        canDeactivate: [PendingRequestGuard],
        loadComponent: () => import('@regulators/delete/delete.component').then((c) => c.DeleteComponent),
      },
      {
        path: '2fa',
        loadChildren: () => import('../two-fa/two-fa.routes').then((m) => m.TWO_FA_ROUTES),
      },
      {
        path: 'file-download/:uuid',
        title: 'Your download has started',
        loadComponent: () =>
          import('@regulators/file-download/signature-file-download.component').then(
            (c) => c.SignatureFileDownloadComponent,
          ),
      },
    ],
  },
  {
    path: 'file-download/:uuid',
    title: 'Your download has started',
    loadComponent: () =>
      import('@regulators/file-download/signature-file-download.component').then(
        (c) => c.SignatureFileDownloadComponent,
      ),
  },
  {
    path: 'external-contacts',
    loadChildren: () => import('./external-contacts/external-contacts.routes').then((m) => m.EXTERNAL_CONTACTS_ROUTES),
  },
];
