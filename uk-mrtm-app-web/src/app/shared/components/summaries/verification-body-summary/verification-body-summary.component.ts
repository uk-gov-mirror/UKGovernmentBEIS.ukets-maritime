import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { VerificationBodyCreationDTO, VerificationBodyDTO } from '@mrtm/api';

import {
  LinkDirective,
  SummaryListComponent,
  SummaryListRowActionsDirective,
  SummaryListRowDirective,
  SummaryListRowKeyDirective,
  SummaryListRowValueDirective,
} from '@netz/govuk-components';

import { CountryPipe } from '@shared/pipes';

@Component({
  selector: 'mrtm-verification-body-summary',
  imports: [
    SummaryListComponent,
    SummaryListRowDirective,
    SummaryListRowKeyDirective,
    SummaryListRowActionsDirective,
    SummaryListRowValueDirective,
    RouterLink,
    LinkDirective,
    CountryPipe,
  ],
  standalone: true,
  templateUrl: './verification-body-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationBodySummaryComponent {
  readonly summaryInfo = input<VerificationBodyCreationDTO | VerificationBodyDTO>();
  readonly formRouterLink = input('edit');
  readonly editable = input(true);
}
