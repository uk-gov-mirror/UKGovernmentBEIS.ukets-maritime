import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, CanDeactivateFn, Router } from '@angular/router';

import { catchError, map, of } from 'rxjs';

import { RequestActionsService } from '@mrtm/api';

import { PendingRequestService } from '@netz/common/services';
import { RequestActionStore } from '@netz/common/store';

export function getRequestActionPageCanActivateGuard(actionIdParam = 'actionId'): CanActivateFn {
  return (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);
    const store = inject(RequestActionStore);
    const service = inject(RequestActionsService);
    const pendingRequestService = inject(PendingRequestService);

    const id = +route.paramMap.get(actionIdParam);
    if (!route.paramMap.has(actionIdParam) || Number.isNaN(id)) {
      console.warn(`No :${actionIdParam} param in route`);
      return true;
    }

    return service.getRequestActionById(id).pipe(
      map((action) => {
        store.setAction(action);
        return true;
      }),
      pendingRequestService.trackRequest(),
      catchError(() => {
        return of(router.createUrlTree(['dashboard']));
      }),
    );
  };
}

export function getRequestActionPageCanDeactivateGuard(): CanDeactivateFn<unknown> {
  return () => {
    inject(RequestActionStore).reset();
    return true;
  };
}
