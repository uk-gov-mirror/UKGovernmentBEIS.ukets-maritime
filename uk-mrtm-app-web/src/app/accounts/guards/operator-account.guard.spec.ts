import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { lastValueFrom, Observable, of } from 'rxjs';

import { AccountReportingStatusHistoryService, MaritimeAccountsService, MaritimeAccountUpdateService } from '@mrtm/api';

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
      pipe: vi.fn().mockReturnValue(of({ paging: { page: 1, pageSize: 10 } })),
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
});
