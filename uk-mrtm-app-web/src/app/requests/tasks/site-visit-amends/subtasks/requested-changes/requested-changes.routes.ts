import { Routes } from '@angular/router';

import { regulatorCommentsSubtaskMap } from '@requests/common/emp/subtasks/subtask-list.map';

export const REQUEST_CHANGES_ROUTES: Routes = [
  {
    path: '',
    title: regulatorCommentsSubtaskMap.requestedChanges.title,
    data: { breadcrumb: false, backlink: '../../' },
    loadComponent: () =>
      import('@requests/tasks/site-visit-amends/subtasks/requested-changes/requested-changes-question').then(
        (c) => c.RequestedChangesQuestionComponent,
      ),
  },
];
