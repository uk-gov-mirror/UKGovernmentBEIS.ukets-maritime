import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { TaskItemStatus } from '@requests/common';
import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import { REQUESTED_CHANGES_SUB_TASK } from '@requests/tasks/site-visit-amends/subtasks/requested-changes';

export const canActivateSiteVisitAmendsSubmit: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(RequestTaskStore);
  const isEditable = store.select(requestTaskQuery.selectIsEditable)();
  const canSubmit =
    store.select(siteVisitCommonQuery.allSectionsCompleted)() &&
    store.select(siteVisitCommonQuery.selectStatusForSubtask(REQUESTED_CHANGES_SUB_TASK))() ===
      TaskItemStatus.COMPLETED;

  return (isEditable && canSubmit) || createUrlTreeFromSnapshot(route, ['../../']);
};
