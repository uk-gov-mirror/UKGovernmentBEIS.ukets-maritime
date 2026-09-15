import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { AccountDetailsHistoryDTO, AccountDetailsHistoryListResponse } from '@mrtm/api';

import { PageHeadingComponent } from '@netz/common/components';
import { GovukDatePipe } from '@netz/common/pipes';
import {
  AccordionComponent,
  AccordionItemComponent,
  SummaryListComponent,
  SummaryListRowDirective,
  SummaryListRowKeyDirective,
  SummaryListRowValueDirective,
  TableComponent,
} from '@netz/govuk-components';

import {
  OPERATOR_DETAILS_HISTORY_COLUMNS,
  OPERATOR_DETAILS_HISTORY_FIELDS,
} from '@accounts/containers/operator-details-history/operator-details-history.constants';
import {
  OperatorDetailsHistoryChangesRow,
  OperatorDetailsHistoryValue,
} from '@accounts/containers/operator-details-history/operator-details-history.types';
import { OperatorAccountsStore, selectOperatorDetailsHistory } from '@accounts/store';
import { CountryPipe } from '@shared/pipes';
import { isEqual } from '@shared/utils';

@Component({
  selector: 'mrtm-operator-details-history',
  imports: [
    PageHeadingComponent,
    AccordionComponent,
    AccordionItemComponent,
    GovukDatePipe,
    CountryPipe,
    SummaryListComponent,
    SummaryListRowDirective,
    SummaryListRowKeyDirective,
    SummaryListRowValueDirective,
    TableComponent,
  ],
  templateUrl: './operator-details-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatorDetailsHistoryComponent {
  private readonly store = inject(OperatorAccountsStore);

  readonly columns = OPERATOR_DETAILS_HISTORY_COLUMNS;
  readonly historyList: Signal<AccountDetailsHistoryListResponse['accountDetailsHistoryList']> = toSignal(
    this.store.pipe(selectOperatorDetailsHistory),
  );

  readonly historyItems = computed(() =>
    (this.historyList() ?? []).map((item) => ({ item, changes: this.getChanges(item) })),
  );

  private getChanges(item: AccountDetailsHistoryDTO): OperatorDetailsHistoryChangesRow[] {
    const previous = (item.previousValue ?? {}) as OperatorDetailsHistoryValue;
    const next = (item.newValue ?? {}) as OperatorDetailsHistoryValue;

    return OPERATOR_DETAILS_HISTORY_FIELDS.filter(({ key }) => !isEqual(previous[key], next[key])).map(
      ({ key, label, type }) => ({ label, type, previous: previous[key], new: next[key] }),
    );
  }
}
