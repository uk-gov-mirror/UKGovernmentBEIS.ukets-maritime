import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { delay, first, firstValueFrom, lastValueFrom, Observable, of } from 'rxjs';

import { AccountReportingStatusHistoryService, MaritimeAccountsService, MaritimeAccountUpdateService } from '@mrtm/api';

import { PendingRequestService } from '@netz/common/services';
import { ActivatedRouteSnapshotStub, mockClass } from '@netz/common/testing';

import { canActivateOperatorAccount } from '@accounts/guards/operator-account.guard';
import { OperatorAccountsStore } from '@accounts/store';
import { mockedAccount, mockReportingStatusesResults } from '@accounts/testing/accounts-data.mock';
import { Mocked } from 'vitest';

describe('canActivateOperatorAccount', () => {
  let accountsService: Partial<Mocked<MaritimeAccountsService>>;
  let reportingStatusesService: Partial<Mocked<AccountReportingStatusHistoryService>>;
  let operatorAccountsStore: Partial<Mocked<OperatorAccountsStore>>;

  const executeGuard: CanActivateFn = (route: ActivatedRouteSnapshotStub) =>
    TestBed.runInInjectionContext(() => canActivateOperatorAccount(route));

  beforeEach(() => {
    accountsService = {
      getMaritimeAccount: vi.fn().mockReturnValueOnce(of(mockedAccount)),
    };
    reportingStatusesService = {
      getAllReportingStatuses: vi.fn().mockReturnValueOnce(of(mockReportingStatusesResults)),
    };

    operatorAccountsStore = {
      getState: vi.fn().mockReturnValue({ currentAccount: { reportingStatus: { paging: { page: 1, pageSize: 10 } } } }),
      setCurrentAccount: vi.fn(),
      setReportingStatuses: vi.fn(),
      setReportingStatusTotal: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: OperatorAccountsStore, useValue: operatorAccountsStore },
        { provide: MaritimeAccountsService, useValue: accountsService },
        { provide: MaritimeAccountUpdateService, useValue: mockClass(MaritimeAccountUpdateService) },
        { provide: AccountReportingStatusHistoryService, useValue: reportingStatusesService },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should check account existence', async () => {
    const route = new ActivatedRouteSnapshotStub({ accountId: '1' });
    const result$ = executeGuard(route, null) as Observable<boolean>;

    await expect(lastValueFrom(result$)).resolves.toEqual(true);

    expect(accountsService.getMaritimeAccount).toHaveBeenCalledWith(1);
  });

  it('should request the account only once, even though it writes the response back into the store', async () => {
    const getMaritimeAccount = vi.fn().mockReturnValue(of(mockedAccount).pipe(delay(1)));
    const getAllReportingStatuses = vi.fn().mockReturnValue(of(mockReportingStatusesResults).pipe(delay(1)));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        OperatorAccountsStore,
        { provide: MaritimeAccountsService, useValue: { getMaritimeAccount } },
        { provide: AccountReportingStatusHistoryService, useValue: { getAllReportingStatuses } },
        { provide: MaritimeAccountUpdateService, useValue: mockClass(MaritimeAccountUpdateService) },
        { provide: PendingRequestService, useValue: mockClass(PendingRequestService) },
      ],
    });

    const route = new ActivatedRouteSnapshotStub({ accountId: '35' });
    const result$ = executeGuard(route, null) as Observable<boolean>;

    // The router takes the first emission and then unsubscribes.
    await firstValueFrom(result$.pipe(first()));

    expect(getMaritimeAccount).toHaveBeenCalledTimes(1);
    expect(getAllReportingStatuses).toHaveBeenCalledTimes(1);
  });
});
