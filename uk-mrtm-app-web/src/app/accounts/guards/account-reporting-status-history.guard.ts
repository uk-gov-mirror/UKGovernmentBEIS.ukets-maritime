import { inject, Service } from '@angular/core';
import { ActivatedRouteSnapshot, UrlTree } from '@angular/router';

import { map, Observable, of, tap } from 'rxjs';

import { AccountReportingStatusHistoryService } from '@mrtm/api';

import { AuthStore, selectUserRoleType } from '@netz/common/auth';

import { OperatorAccountsStore } from '@accounts/store';

@Service()
export class AccountReportingStatusHistoryGuard {
  private readonly authStore = inject(AuthStore);
  private readonly store = inject(OperatorAccountsStore);
  private readonly reportingStatusService = inject(AccountReportingStatusHistoryService);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const userRole = this.authStore.select(selectUserRoleType)();
    const accountId = Number(route.paramMap.get('accountId'));

    if (userRole !== 'REGULATOR') {
      return of(false);
    }

    return this.reportingStatusService.getReportingStatusHistory(accountId).pipe(
      tap((reportingStatusHistory) => {
        this.store.setReportingStatusHistory(reportingStatusHistory);
      }),
      map((res) => !!res),
    );
  }
}
