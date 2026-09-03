import { inject, Service } from '@angular/core';
import { UrlTree } from '@angular/router';

import { first, map, Observable } from 'rxjs';

import { AuthStore, selectUserRoleType } from '@netz/common/auth';

import { OperatorAccountsStore } from '@accounts/store';
import { AuthService } from '@core/services/auth.service';

@Service()
export class CreateOperatorAccountGuard {
  private readonly authService: AuthService = inject(AuthService);
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly store: OperatorAccountsStore = inject(OperatorAccountsStore);

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.checkUser().pipe(
      map(() => this.authStore.select(selectUserRoleType)() === 'REGULATOR'),
      first(),
    );
  }

  canDeactivate(): boolean {
    this.store.resetCreateAccount();
    return true;
  }
}
