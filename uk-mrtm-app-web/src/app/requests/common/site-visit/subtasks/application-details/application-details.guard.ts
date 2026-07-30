import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import {
  APPLICATION_DETAILS_SUBTASK,
  ApplicationDetailsWizardSteps,
  isWizardCompleted,
} from '@requests/common/site-visit/subtasks/application-details/application-details.helpers';
import { TaskItemStatus } from '@requests/common/task-item-status';

export const canActivateApplicationDetailsSummary: CanActivateFn = (activatedRoute: ActivatedRouteSnapshot) => {
  const store = inject(RequestTaskStore);
  const isEditable = store.select(requestTaskQuery.selectIsEditable)();
  const status = store.select(siteVisitCommonQuery.selectStatusForSubtask(APPLICATION_DETAILS_SUBTASK))();
  const siteVisit = store.select(siteVisitCommonQuery.selectPayload)()?.siteVisit;

  return (
    !isEditable ||
    (isEditable && (status === TaskItemStatus.COMPLETED || isWizardCompleted(siteVisit))) ||
    createUrlTreeFromSnapshot(activatedRoute, ['./', ApplicationDetailsWizardSteps.EVIDENCE])
  );
};
