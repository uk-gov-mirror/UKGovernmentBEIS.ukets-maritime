import { inject, Service } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { map, Observable } from 'rxjs';

import { OperatorAccountsStore, selectIsInitiallySubmitted } from '@accounts/store';

@Service()
export class CreateOperatorAccountSummaryGuard {
  private readonly store = inject(OperatorAccountsStore);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.pipe(
      selectIsInitiallySubmitted,
      map((isInitiallySubmitted) => {
        return isInitiallySubmitted || this.router.parseUrl('/accounts/create');
      }),
    );
  }
}
