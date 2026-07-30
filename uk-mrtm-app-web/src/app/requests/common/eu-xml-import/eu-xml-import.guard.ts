import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

export const canActivateEuXmlImport: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(RequestTaskStore);
  const allowedActions = store.select(requestTaskQuery.selectAllowedRequestTaskActions)();

  return allowedActions.includes('EMP_ISSUANCE_IMPORT_THETIS_XML') || createUrlTreeFromSnapshot(route, ['../']);
};
