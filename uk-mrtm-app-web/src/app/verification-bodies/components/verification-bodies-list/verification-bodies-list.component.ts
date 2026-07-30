import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { VerificationBodyDTO } from '@mrtm/api';

import {
  GovukSelectOption,
  GovukTableColumn,
  LinkDirective,
  SelectComponent,
  TableComponent,
} from '@netz/govuk-components';

import { existingControlContainer } from '@shared/providers';
import {
  VERIFICATION_BODIES_LIST_COLUMNS,
  VERIFICATION_BODY_STATUSES,
} from '@verification-bodies/components/verification-bodies-list/verification-bodies-list.constants';
import { VerificationBodyStatusPipe } from '@verification-bodies/pipes/verification-body-status.pipe';

@Component({
  selector: 'mrtm-verification-bodies-list',
  imports: [
    TableComponent,
    LinkDirective,
    RouterLink,
    ReactiveFormsModule,
    SelectComponent,
    VerificationBodyStatusPipe,
  ],
  standalone: true,
  templateUrl: './verification-bodies-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [existingControlContainer],
})
export class VerificationBodiesListComponent {
  readonly data = input<VerificationBodyDTO[]>();
  readonly editable = input<boolean>(true);

  readonly editableColumns: GovukTableColumn[] = VERIFICATION_BODIES_LIST_COLUMNS;
  readonly readonlyColumns: GovukTableColumn[] = VERIFICATION_BODIES_LIST_COLUMNS.slice(0, 2);
  readonly verificationBodyStatuses: GovukSelectOption<VerificationBodyDTO['status']>[] = VERIFICATION_BODY_STATUSES;
}
