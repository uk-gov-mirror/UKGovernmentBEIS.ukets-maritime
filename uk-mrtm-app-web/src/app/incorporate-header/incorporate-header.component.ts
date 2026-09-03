import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { catchError, combineLatest, distinctUntilChanged, EMPTY, map, Observable, of, switchMap } from 'rxjs';

import { MaritimeAccountsService, MrtmAccountEmpDTO } from '@mrtm/api';

import { requestActionQuery, RequestActionStore, requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { LinkDirective, TagComponent } from '@netz/govuk-components';

import { OperatorAccountsStatusColorPipe } from '@accounts/pipes';
import { OperatorAccountsStore, selectCurrentAccount } from '@accounts/store';

@Component({
  selector: 'mrtm-incorporate-header',
  imports: [RouterLink, AsyncPipe, LinkDirective, TagComponent, TitleCasePipe, OperatorAccountsStatusColorPipe],
  standalone: true,
  templateUrl: './incorporate-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncorporateHeaderComponent {
  private readonly requestTaskStore = inject(RequestTaskStore);
  private readonly requestActionStore = inject(RequestActionStore);
  private readonly maritimeAccountsService = inject(MaritimeAccountsService);
  private readonly operatorAccountsStore = inject(OperatorAccountsStore);

  accountDetails$: Observable<MrtmAccountEmpDTO> = combineLatest([
    this.requestTaskStore.rxSelect(requestTaskQuery.selectRequestTaskAccountId),
    this.requestActionStore.rxSelect(requestActionQuery.selectAction).pipe(map((action) => action?.requestAccountId)),
    this.operatorAccountsStore.pipe(selectCurrentAccount),
  ]).pipe(
    map(([requestTaskAccountId, requestActionAccountId, currentAccount]) => ({
      accountId: Number(requestTaskAccountId ?? requestActionAccountId ?? currentAccount?.account?.id) || null,
      currentAccount,
    })),
    // The store emits on every state change, most of which leave the account untouched.
    distinctUntilChanged(
      (a, b) => a.accountId === b.accountId && a.currentAccount?.account === b.currentAccount?.account,
    ),
    switchMap(({ accountId, currentAccount }) => {
      if (!accountId) {
        return of(null);
      }

      // The account guard has already loaded this account into the store, so asking the API again
      // would just duplicate its request on every account page.
      if (currentAccount?.account?.id === accountId) {
        return of(currentAccount);
      }

      return this.maritimeAccountsService.getMaritimeAccount(accountId).pipe(catchError(() => EMPTY));
    }),
  );
}
