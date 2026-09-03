import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { map, of, tap } from 'rxjs';

import { AccountDetailsHistoryService } from '@mrtm/api';

import { AuthStore, selectUserRoleType } from '@netz/common/auth';

import { OperatorAccountsStore } from '@accounts/store';

export const canActivateOperatorDetailsHistory: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const store = inject(OperatorAccountsStore);
  const accountDetailsHistoryService = inject(AccountDetailsHistoryService);

  const userRole = authStore.select(selectUserRoleType)();
  const accountId = Number(route.paramMap.get('accountId'));

  if (userRole !== 'REGULATOR') {
    return of(false);
  }

  return accountDetailsHistoryService.getAccountDetailsHistory(accountId).pipe(
    tap((accountDetailsHistory) => {
      store.setAccountDetailsHistory(accountDetailsHistory);
    }),
    map((res) => !!res),
  );
};
