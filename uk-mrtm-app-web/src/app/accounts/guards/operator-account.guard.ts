import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivateFn } from '@angular/router';

import { combineLatest, map, Observable, of, tap } from 'rxjs';

import { AccountReportingStatusHistoryService, MaritimeAccountsService } from '@mrtm/api';

import { OperatorAccountsStore } from '@accounts/store';

export const canActivateOperatorAccount = (route: ActivatedRouteSnapshot): Observable<boolean> => {
  const store = inject(OperatorAccountsStore);
  const accountService = inject(MaritimeAccountsService);
  const reportingStatusService = inject(AccountReportingStatusHistoryService);
  const accountId = Number(route.paramMap.get('accountId'));

  // Read the paging once instead of subscribing to the store: the tap below writes back into the same
  // store, so a live subscription would re-enter the switchMap and fire these requests again.
  const paging = store.getState().currentAccount.reportingStatus.paging;

  return combineLatest([
    accountService.getMaritimeAccount(accountId),
    reportingStatusService.getAllReportingStatuses(accountId, paging.page - 1, paging.pageSize),
  ]).pipe(
    tap(([account, reportingStatuses]) => {
      store.setCurrentAccount(account);
      store.setReportingStatuses((reportingStatuses as any)?.reportingStatusList);
      store.setReportingStatusTotal((reportingStatuses as any)?.total);
    }),
    map(([account]) => !!account),
  );
};

export const canDeactivateOperatorAccount: CanDeactivateFn<Observable<boolean>> = () => {
  const operatorAccountsStore = inject(OperatorAccountsStore);
  operatorAccountsStore.reset();

  return of(true);
};
