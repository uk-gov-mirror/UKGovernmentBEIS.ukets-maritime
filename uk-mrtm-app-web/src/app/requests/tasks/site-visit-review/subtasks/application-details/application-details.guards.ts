import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { ApplicationDetailsWizardSteps } from '@requests/common/site-visit/subtasks/application-details';
import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';

export const canActivateApplicationDetailsSummary: CanActivateFn = (activatedRoute: ActivatedRouteSnapshot) => {
  const store = inject(RequestTaskStore);
  const isEditable = store.select(requestTaskQuery.selectIsEditable)();
  const reviewDecision = store.select(siteVisitReviewQuery.selectReviewDecision)();

  return (
    !isEditable ||
    (isEditable && !!reviewDecision?.type) ||
    createUrlTreeFromSnapshot(activatedRoute, [ApplicationDetailsWizardSteps.DECISION])
  );
};
