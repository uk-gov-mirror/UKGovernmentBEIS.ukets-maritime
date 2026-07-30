import { Routes } from '@angular/router';

export const ACCOUNT_CLOSURE_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'confirmation',
        title: 'Close account',
        data: { backlink: '../../', breadcrumb: false },
        loadComponent: () =>
          import('@requests/tasks/account-closure/components').then((c) => c.AccountClosureConfirmationComponent),
      },
      {
        path: 'success',
        title: 'Account closed successfully',
        loadComponent: () =>
          import('@requests/tasks/account-closure/components').then((c) => c.AccountClosureSuccessComponent),
      },
    ],
  },
];
