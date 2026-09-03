import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { GovukDatePipe } from '@netz/common/pipes';
import {
  LinkDirective,
  SummaryListComponent,
  SummaryListRowActionsDirective,
  SummaryListRowDirective,
  SummaryListRowKeyDirective,
  SummaryListRowValueDirective,
} from '@netz/govuk-components';

import { OperatorAccountsStore, selectAccount } from '@accounts/store';
import { CountryPipe } from '@shared/pipes';

@Component({
  selector: 'mrtm-operator-account-details',
  imports: [
    CommonModule,
    RouterLink,
    SummaryListComponent,
    SummaryListRowDirective,
    SummaryListRowKeyDirective,
    SummaryListRowValueDirective,
    SummaryListRowActionsDirective,
    LinkDirective,
    CountryPipe,
    GovukDatePipe,
  ],
  standalone: true,
  templateUrl: './operator-account-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatorAccountDetailsComponent {
  private readonly store: OperatorAccountsStore = inject(OperatorAccountsStore);

  readonly isEditable = input<boolean>(true);
  readonly formRouterLink = input('edit');

  readonly accountInfo = toSignal(this.store.pipe(selectAccount));
}
