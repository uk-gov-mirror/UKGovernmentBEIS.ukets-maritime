import { Routes } from '@angular/router';

export const RETURN_FOR_CHANGES_ROUTES: Routes = [
  {
    path: '',
    title: 'Return for changes',
    data: { backlink: '../../', breadcrumb: false },
    loadComponent: () =>
      import('@requests/tasks/site-visit-review/subtasks/return-for-changes/return-for-changes-summary').then(
        (c) => c.ReturnForChangesSummaryComponent,
      ),
  },
  {
    path: 'success',
    title: 'Returned to operator for changes',
    data: { breadcrumb: 'Dashboard' },
    loadComponent: () =>
      import('@requests/tasks/site-visit-review/subtasks/return-for-changes/return-for-changes-success').then(
        (c) => c.ReturnForChangesSuccessComponent,
      ),
  },
];
