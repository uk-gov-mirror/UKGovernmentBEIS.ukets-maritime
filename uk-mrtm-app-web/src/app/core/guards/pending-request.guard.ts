import { inject, Service } from '@angular/core';
import { CanDeactivate, Router } from '@angular/router';

import { combineLatest, first, map, Observable, tap } from 'rxjs';

import { PendingRequestService } from '@netz/common/services';

import { PendingRequest } from '@core/interfaces';

@Service()
export class PendingRequestGuard implements CanDeactivate<PendingRequest> {
  private readonly router = inject(Router);
  private readonly pendingRequest = inject(PendingRequestService);

  canDeactivate(component: PendingRequest | any): boolean | Observable<boolean> {
    return (
      this.router.currentNavigation()?.extras?.state?.forceNavigation ||
      combineLatest([
        this.pendingRequest.isRequestPending$,
        ...(this.isPendingRequest(component) ? [component.pendingRequest.isRequestPending$] : []),
      ]).pipe(
        map((pendingRequests) => pendingRequests.some((isRequestPending) => isRequestPending)),
        first(),
        tap((isPending) => {
          if (isPending) {
            alert(
              'A server request is pending. We suggest that you stay on this page in order not to lose your progress.',
            );
          }
        }),
        map((isPending) => !isPending),
      )
    );
  }

  private isPendingRequest(component: PendingRequest | any): component is PendingRequest {
    return component.pendingRequest;
  }
}
