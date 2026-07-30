import { Routes } from '@angular/router';

import { PendingRequestGuard } from '@core/guards/pending-request.guard';
import { DeleteGuard } from '@regulators/external-contacts/delete/delete.guard';
import { DetailsGuard } from '@regulators/external-contacts/details/details.guard';

export const EXTERNAL_CONTACTS_ROUTES: Routes = [
  {
    path: 'add',
    title: 'Add an external contact',
    data: { breadcrumb: true },
    canDeactivate: [PendingRequestGuard],
    loadComponent: () =>
      import('@regulators/external-contacts/details/details.component').then((c) => c.DetailsComponent),
  },
  {
    path: ':userId',
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'External contact details',
        data: { breadcrumb: true },
        canActivate: [DetailsGuard],
        resolve: { contact: DetailsGuard },
        canDeactivate: [PendingRequestGuard],
        loadComponent: () =>
          import('@regulators/external-contacts/details/details.component').then((c) => c.DetailsComponent),
      },
      {
        path: 'delete',
        pathMatch: 'full',
        title: 'Confirm that this external contact will be deleted',
        data: { breadcrumb: 'Delete external contact' },
        canActivate: [DeleteGuard],
        resolve: { contact: DeleteGuard },
        canDeactivate: [PendingRequestGuard],
        loadComponent: () =>
          import('@regulators/external-contacts/delete/delete.component').then((c) => c.DeleteComponent),
      },
    ],
  },
];
