import { inject, Service } from '@angular/core';
import { UrlTree } from '@angular/router';

import { combineLatest, map, Observable } from 'rxjs';

import { AuthStore, selectUserRoleType } from '@netz/common/auth';

import { OperatorAccountsStore, selectAccount } from '@accounts/store';

@Service()
export class EditOperatorAccountGuard {
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly store: OperatorAccountsStore = inject(OperatorAccountsStore);

  canActivate(): Observable<boolean | UrlTree> {
    return combineLatest([this.authStore.rxSelect(selectUserRoleType), this.store.pipe(selectAccount)]).pipe(
      map(([role, account]) => role === 'REGULATOR' && account.status !== 'CLOSED'),
    );
  }
}
