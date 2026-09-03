import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';

import { Observable, switchMap, tap } from 'rxjs';
import { produce } from 'immer';

import {
  AccountDetailsHistoryListResponse,
  AccountReportingStatusHistoryCreationDTO,
  AccountReportingStatusHistoryListResponse,
  AccountReportingStatusHistoryService,
  AccountSearchResultInfoDTO,
  MaritimeAccountsService,
  MaritimeAccountUpdateService,
  MrtmAccountDTO,
  MrtmAccountEmpDTO,
  MrtmAccountSearchCriteria,
  MrtmAccountUpdateDTO,
} from '@mrtm/api';

import { PendingRequestService } from '@netz/common/services';

import {
  initialCreateAccountState,
  initialCurrentAccountState,
  initialState,
  OperatorAccountsState,
} from '@accounts/store/operator-accounts.state';
import { ReportingStatusListItem } from '@accounts/types';
import { Store } from '@core/store';
import { Paging } from '@shared/types';

@Service()
export class OperatorAccountsStore extends Store<OperatorAccountsState> {
  private readonly service: MaritimeAccountsService = inject(MaritimeAccountsService);
  private readonly updateService: MaritimeAccountUpdateService = inject(MaritimeAccountUpdateService);
  private readonly pendingRequestService: PendingRequestService = inject(PendingRequestService);
  private readonly reportingStatusService = inject(AccountReportingStatusHistoryService);

  constructor() {
    super(initialState);
  }

  setIsInitiallySubmitted(isInitiallySubmitted: boolean) {
    this.setState(
      produce(this.getState(), (state) => {
        state.createAccount.isInitiallySubmitted = isInitiallySubmitted;
      }),
    );
  }

  setIsSubmitted(isSubmitted: boolean) {
    this.setState(
      produce(this.getState(), (state) => {
        state.createAccount.isSubmitted = isSubmitted;
      }),
    );
  }

  setNewAccount(newAccount: MrtmAccountDTO) {
    this.setState(
      produce(this.getState(), (state) => {
        state.createAccount.newAccount = newAccount;
      }),
    );
  }

  setCurrentAccount(currentAccount: MrtmAccountEmpDTO) {
    this.setState(
      produce(this.getState(), (state) => {
        state.currentAccount.account = currentAccount.account;
        state.currentAccount.emp = currentAccount.emp;
      }),
    );
  }

  resetCurrentAccount(): void {
    this.setState(
      produce(this.getState(), (state) => {
        state.currentAccount = initialCurrentAccountState;
      }),
    );
  }

  resetCreateAccount() {
    this.setState(
      produce(this.getState(), (state) => {
        state.createAccount = initialCreateAccountState;
      }),
    );
  }

  createAccount(): Observable<void> {
    return this.service
      .createMaritimeAccount(this.getState().createAccount.newAccount)
      .pipe(this.pendingRequestService.trackRequest());
  }

  editAccount(accountId: number): Observable<HttpResponse<void>> {
    return this.updateService.updateMaritimeAccount(
      accountId,
      this.getState().currentAccount.account as MrtmAccountUpdateDTO,
    );
  }

  setSearchFilters(searchFilters: MrtmAccountSearchCriteria) {
    this.setState(
      produce(this.getState(), (state) => {
        state.accountsSearch = {
          ...state.accountsSearch,
          ...searchFilters,
        };
      }),
    );
  }

  setSearchErrorSummaryVisible(searchErrorSummaryVisible: boolean) {
    this.setState(
      produce(this.getState(), (state) => {
        state.accountsSearch.searchErrorSummaryVisible = searchErrorSummaryVisible;
      }),
    );
  }

  setAccounts(accounts: AccountSearchResultInfoDTO[]) {
    this.setState(
      produce(this.getState(), (state) => {
        state.accountsSearch.accounts = accounts;
      }),
    );
  }

  setTotal(total: number) {
    this.setState(
      produce(this.getState(), (state) => {
        state.accountsSearch.total = total;
      }),
    );
  }

  setPaging(paging: Paging) {
    this.setState(
      produce(this.getState(), (state) => {
        state.accountsSearch.paging = paging;
      }),
    );
  }

  submitReportingStatus(year: string, reportingStatus: AccountReportingStatusHistoryCreationDTO): Observable<any> {
    return this.reportingStatusService
      .submitReportingStatus(this.getState().currentAccount.account.id, year, reportingStatus)
      .pipe(
        this.pendingRequestService.trackRequest(),
        switchMap(() => {
          const { account, reportingStatus } = this.getState().currentAccount;
          return this.reportingStatusService.getAllReportingStatuses(account.id, 0, reportingStatus?.paging.pageSize);
        }),
        tap((res) => {
          this.setReportingStatuses((res as any)?.reportingStatusList);
          this.setReportingStatusTotal((res as any)?.total);
        }),
      );
  }

  editReportingStatus(reportingStatus: AccountReportingStatusHistoryCreationDTO): void {
    this.setState(
      produce(this.getState(), (state) => {
        state.currentAccount.reportingStatus.upsertStatus = reportingStatus;
      }),
    );
  }

  setReportingStatuses(reportingStatuses: Array<ReportingStatusListItem>) {
    this.setState(
      produce(this.getState(), (state) => {
        state.currentAccount.reportingStatus.statuses = reportingStatuses;
      }),
    );
  }

  setReportingStatusTotal(total: number) {
    this.setState(
      produce(this.getState(), (state) => {
        state.currentAccount.reportingStatus.total = total;
      }),
    );
  }

  setReportingStatusCurrentPage(page: number) {
    this.setState(
      produce(this.getState(), (state) => {
        state.currentAccount.reportingStatus.paging.page = page;
      }),
    );
  }

  setReportingStatusHistory(history: AccountReportingStatusHistoryListResponse) {
    this.setState(
      produce(this.getState(), (state) => {
        state.currentAccount.reportingStatus.history = history.reportingStatusHistoryList;
      }),
    );
  }

  setAccountDetailsHistory(history: AccountDetailsHistoryListResponse) {
    this.setState(
      produce(this.getState(), (state) => {
        state.currentAccount.operatorDetailsHistory = history.accountDetailsHistoryList;
      }),
    );
  }

  setCurrentStatus(currentStatus: ReportingStatusListItem) {
    this.setState(
      produce(this.getState(), (state) => {
        state.currentAccount.reportingStatus.currentStatus = currentStatus;
      }),
    );
  }

  resetEditReportingStatus() {
    this.setState(
      produce(this.getState(), (state) => {
        state.currentAccount.reportingStatus.upsertStatus = undefined;
        state.currentAccount.reportingStatus.currentStatus = undefined;
      }),
    );
  }
}
