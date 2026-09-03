import { inject, Service } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { combineLatest, map, Observable, take } from 'rxjs';

import {
  OperatorAccountsStore,
  selectIsInitiallySubmitted,
  selectIsSubmitted,
  selectNewAccount,
} from '@accounts/store';

@Service()
export class CreateOperatorAccountSuccessGuard {
  private readonly store = inject(OperatorAccountsStore);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return combineLatest([
      this.store.pipe(selectIsInitiallySubmitted),
      this.store.pipe(selectIsSubmitted),
      this.store.pipe(selectNewAccount),
    ]).pipe(
      take(1),
      map(([isInitiallySubmitted, isSubmitted, newAccount]) => {
        if (isSubmitted) {
          return true;
        } else if (isInitiallySubmitted && newAccount) {
          return this.router.parseUrl('/accounts/create');
        } else {
          return this.router.parseUrl('/dashboard');
        }
      }),
    );
  }
}
