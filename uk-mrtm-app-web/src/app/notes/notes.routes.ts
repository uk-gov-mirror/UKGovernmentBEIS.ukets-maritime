import { Route } from '@angular/router';

import { PendingRequestGuard } from '@core/guards';

export const NOTES_ROUTES: Route[] = [
  {
    path: '',
    children: [
      {
        path: 'add',
        title: 'Add a note',
        data: { heading: 'Add a note', breadcrumb: false, backlink: '../../', backlinkFragment: 'notes' },
        canDeactivate: [PendingRequestGuard],
        loadComponent: () => import('@notes/components').then((c) => c.UpsertNoteComponent),
      },
      {
        path: ':noteId/edit',
        title: 'Change the note',
        data: { heading: 'Change the note', breadcrumb: false, backlink: '../../../', backlinkFragment: 'notes' },
        canDeactivate: [PendingRequestGuard],
        loadComponent: () => import('@notes/components').then((c) => c.UpsertNoteComponent),
      },
      {
        path: ':noteId/delete',
        title: 'Delete a note',
        data: { breadcrumb: false, backlink: '../../../', backlinkFragment: 'notes' },
        canDeactivate: [PendingRequestGuard],
        loadComponent: () => import('@notes/components').then((c) => c.DeleteNoteComponent),
      },
    ],
  },
];
