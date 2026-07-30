import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { combineLatest, distinctUntilChanged, map, Observable, switchMap, takeUntil } from 'rxjs';

import { AccountSearchResultInfoDTO, MaritimeAccountsService, UserStateDTO } from '@mrtm/api';

import { AuthStore, selectUserRoleType } from '@netz/common/auth';
import { FeedbackBannerComponent, PageHeadingComponent } from '@netz/common/components';
import { DestroySubject } from '@netz/common/services';
import { PaginationComponent, SortEvent } from '@netz/govuk-components';

import { AccountsListFiltersComponent } from '@accounts/components/accounts-list-filters';
import { AccountsListComponent } from '@accounts/containers/accounts-list';
import { ACCOUNT_COLUMN_FILTERS_MAP } from '@accounts/containers/accounts-page/accounts-page.constants';
import {
  initialAccountsSearchState,
  OperatorAccountsStore,
  selectAccounts,
  selectPage,
  selectPageSize,
  selectSearchErrorSummaryVisible,
  selectSearchState,
  selectTotal,
} from '@accounts/store';
import { Pagination } from '@shared/types';

interface ViewModel extends Pagination {
  userRoleType: UserStateDTO['roleType'];
  searchTerm: string;
  accounts: AccountSearchResultInfoDTO[];
  isSummaryDisplayed: boolean;
  statuses?: Array<'NEW' | 'LIVE' | 'CLOSED' | 'WITHDRAWN'>;
  contactEmail?: string;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

@Component({
  selector: 'mrtm-accounts',
  imports: [
    PageHeadingComponent,
    AccountsListComponent,
    AsyncPipe,
    PaginationComponent,
    AccountsListFiltersComponent,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './accounts-page.component.html',
  providers: [DestroySubject],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authStore = inject(AuthStore);
  private readonly store = inject(OperatorAccountsStore);
  private readonly maritimeAccountsService = inject(MaritimeAccountsService);
  private readonly destroy$ = inject(DestroySubject);

  vm$: Observable<ViewModel> = combineLatest([
    this.authStore.rxSelect(selectUserRoleType),
    this.store.pipe(selectAccounts),
    this.store.pipe(selectTotal),
    this.store.pipe(selectPage),
    this.store.pipe(selectPageSize),
    this.store.pipe(selectSearchErrorSummaryVisible),
    this.store.pipe(selectSearchState),
  ]).pipe(
    map(
      ([
        role,
        accounts,
        total,
        page,
        pageSize,
        searchErrorSummaryVisible,
        { contactEmail, sortBy, direction, statuses, term },
      ]) => ({
        userRoleType: role,
        searchTerm: term ?? null,
        accounts,
        total,
        page,
        pageSize,
        isSummaryDisplayed: searchErrorSummaryVisible,
        contactEmail,
        sortBy,
        direction,
        statuses,
      }),
    ),
  );

  ngOnInit(): void {
    this.vm$
      .pipe(
        map(({ searchTerm, page, pageSize, contactEmail, sortBy, direction, statuses }) => ({
          searchTerm,
          page,
          pageSize,
          contactEmail,
          sortBy,
          direction,
          statuses,
        })),
        distinctUntilChanged((previous, current) => {
          return (
            previous.page === current.page &&
            previous.pageSize === current.pageSize &&
            previous.searchTerm === current.searchTerm &&
            previous.statuses === current.statuses &&
            previous.direction === current.direction &&
            previous.sortBy === current.sortBy &&
            previous.contactEmail === current.contactEmail
          );
        }),
        switchMap(({ searchTerm, page, pageSize, contactEmail, sortBy, direction, statuses }) => {
          return this.maritimeAccountsService.searchCurrentUserMrtmAccounts({
            page: page - 1,
            size: pageSize,
            term: searchTerm,
            contactEmail,
            sortBy,
            statuses,
            direction,
          });
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(({ accounts, total }) => {
        this.store.setAccounts(accounts);
        this.store.setTotal(total);
      });

    this.route.queryParamMap
      .pipe(
        map((params) => ({
          term: params.get('term')?.trim() || initialAccountsSearchState.searchTerm,
          page: +params.get('page') || initialAccountsSearchState.paging.page,
          pageSize: +params.get('pageSize') || initialAccountsSearchState.paging.pageSize,
          status: params.get('status') || null,
          contactEmail: params.get('contactEmail') || initialAccountsSearchState.contactEmail,
          sortBy: params.get('sortBy') || initialAccountsSearchState.sortBy,
          direction: params.get('direction') || initialAccountsSearchState.direction,
        })),
        takeUntil(this.destroy$),
      )
      .subscribe(({ term, page, pageSize, contactEmail, status, sortBy, direction }) => {
        this.store.setPaging({ page, pageSize });
        this.store.setSearchFilters({
          term,
          statuses: (status ? [status] : undefined) as any,
          contactEmail,
          sortBy,
          direction: direction as any,
        });
      });
  }

  onPageChange(page: number) {
    this.router.navigate([], {
      queryParams: { page },
      queryParamsHandling: 'merge',
      relativeTo: this.route,
    });
  }

  protected onSort(event: SortEvent) {
    this.router.navigate([], {
      queryParams: {
        sortBy: ACCOUNT_COLUMN_FILTERS_MAP?.[event.column],
        direction: event.direction === 'ascending' ? 'ASC' : 'DESC',
      },
      queryParamsHandling: 'merge',
      relativeTo: this.route,
    });
  }
}
