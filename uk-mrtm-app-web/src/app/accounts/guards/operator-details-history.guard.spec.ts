import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { firstValueFrom, Observable, of } from 'rxjs';

import { AccountDetailsHistoryListResponse, AccountDetailsHistoryService } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ActivatedRouteSnapshotStub } from '@netz/common/testing';

import { canActivateOperatorDetailsHistory } from '@accounts/guards/operator-details-history.guard';
import { OperatorAccountsStore } from '@accounts/store';
import { Mocked } from 'vitest';

describe('canActivateOperatorDetailsHistory', () => {
  let authStore: AuthStore;
  let accountDetailsHistoryService: Partial<Mocked<AccountDetailsHistoryService>>;
  let operatorAccountsStore: Partial<Mocked<OperatorAccountsStore>>;

  const mockAccountDetailsHistory: AccountDetailsHistoryListResponse = {
    accountDetailsHistoryList: [],
  };

  const executeGuard: CanActivateFn = (route: ActivatedRouteSnapshotStub) =>
    TestBed.runInInjectionContext(() => canActivateOperatorDetailsHistory(route, null));

  beforeEach(() => {
    accountDetailsHistoryService = {
      getAccountDetailsHistory: vi.fn().mockReturnValue(of(mockAccountDetailsHistory)),
    };

    operatorAccountsStore = {
      setAccountDetailsHistory: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: OperatorAccountsStore, useValue: operatorAccountsStore },
        { provide: AccountDetailsHistoryService, useValue: accountDetailsHistoryService },
      ],
    });

    authStore = TestBed.inject(AuthStore);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow regulators and store the account details history', async () => {
    authStore.setUserState({ roleType: 'REGULATOR' });

    const result$ = executeGuard(new ActivatedRouteSnapshotStub({ accountId: '1' }), null) as Observable<boolean>;

    await expect(firstValueFrom(result$)).resolves.toEqual(true);

    expect(accountDetailsHistoryService.getAccountDetailsHistory).toHaveBeenCalledWith(1);
    expect(operatorAccountsStore.setAccountDetailsHistory).toHaveBeenCalledWith(mockAccountDetailsHistory);
  });

  it('should not allow non-regulators', async () => {
    authStore.setUserState({ roleType: 'OPERATOR' });

    const result$ = executeGuard(new ActivatedRouteSnapshotStub({ accountId: '1' }), null) as Observable<boolean>;

    await expect(firstValueFrom(result$)).resolves.toEqual(false);

    expect(accountDetailsHistoryService.getAccountDetailsHistory).not.toHaveBeenCalled();
  });
});
