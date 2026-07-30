import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AccountSearchResultInfoDTO } from '@mrtm/api';

import { LinkDirective, SortEvent, TableComponent, TagComponent } from '@netz/govuk-components';

import { ACCOUNTS_LIST_COLUMNS } from '@accounts/containers/accounts-list/accounts-list.constants';
import { OperatorAccountsStatusColorPipe } from '@accounts/pipes/operator-accounts-status-color.pipe';
import { NotProvidedDirective } from '@shared/directives';

@Component({
  selector: 'mrtm-accounts-list',
  imports: [
    LinkDirective,
    RouterLink,
    TitleCasePipe,
    OperatorAccountsStatusColorPipe,
    TagComponent,
    TableComponent,
    NotProvidedDirective,
  ],
  standalone: true,
  templateUrl: './accounts-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsListComponent {
  readonly accounts = input<AccountSearchResultInfoDTO[]>();
  readonly columns = ACCOUNTS_LIST_COLUMNS;
  readonly sort = output<SortEvent>();
}
