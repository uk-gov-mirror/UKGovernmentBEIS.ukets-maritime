import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { ButtonDirective, LinkDirective } from '@netz/govuk-components';

import {
  UNCORRECTED_NON_COMPLIANCES_SUB_TASK,
  uncorrectedNonCompliancesMap,
  UncorrectedNonCompliancesStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';

@Component({
  selector: 'mrtm-uncorrected-non-compliances-item-delete',
  imports: [RouterLink, ButtonDirective, LinkDirective, PageHeadingComponent, PendingButtonDirective],
  standalone: true,
  templateUrl: './uncorrected-non-compliances-item-delete.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UncorrectedNonCompliancesItemDeleteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = uncorrectedNonCompliancesMap;
  readonly wizardStep = UncorrectedNonCompliancesStep;
  private readonly subtask = UNCORRECTED_NON_COMPLIANCES_SUB_TASK;
  readonly reference = input<string>();

  onSubmit() {
    this.service
      .saveSubtask(this.subtask, UncorrectedNonCompliancesStep.ITEM_DELETE, this.route, {
        reference: this.reference(),
      })
      .subscribe();
  }
}
