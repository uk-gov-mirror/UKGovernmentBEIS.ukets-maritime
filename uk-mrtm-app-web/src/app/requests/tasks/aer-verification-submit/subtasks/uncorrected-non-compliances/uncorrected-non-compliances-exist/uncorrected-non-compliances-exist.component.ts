import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  UNCORRECTED_NON_COMPLIANCES_SUB_TASK,
  uncorrectedNonCompliancesMap,
  UncorrectedNonCompliancesStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { uncorrectedNonCompliancesExistProvider } from '@requests/tasks/aer-verification-submit/subtasks/uncorrected-non-compliances/uncorrected-non-compliances-exist/uncorrected-non-compliances-exist.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-uncorrected-non-compliances-exist',
  imports: [RadioComponent, RadioOptionComponent, ReactiveFormsModule, WizardStepComponent],
  standalone: true,
  templateUrl: './uncorrected-non-compliances-exist.component.html',
  providers: [uncorrectedNonCompliancesExistProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UncorrectedNonCompliancesExistComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = uncorrectedNonCompliancesMap;

  onSubmit() {
    this.service
      .saveSubtask(
        UNCORRECTED_NON_COMPLIANCES_SUB_TASK,
        UncorrectedNonCompliancesStep.EXIST_FORM,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
