import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';

export const canActivateSiteVisitSubmit: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(RequestTaskStore);
  const isEditable = store.select(requestTaskQuery.selectIsEditable)();
  const canSubmit = store.select(siteVisitCommonQuery.allSectionsCompleted)();

  return (isEditable && canSubmit) || createUrlTreeFromSnapshot(route, ['../../']);
};
