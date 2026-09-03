import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RadioComponent, RadioOptionComponent, TextareaComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  UNCORRECTED_NON_COMPLIANCES_SUB_TASK,
  uncorrectedNonCompliancesMap,
  UncorrectedNonCompliancesStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { uncorrectedNonCompliancesItemFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/uncorrected-non-compliances/uncorrected-non-compliances-item-form/uncorrected-non-compliances-item-form.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-uncorrected-non-compliances-item-form',
  imports: [RadioComponent, RadioOptionComponent, ReactiveFormsModule, TextareaComponent, WizardStepComponent],
  standalone: true,
  templateUrl: './uncorrected-non-compliances-item-form.component.html',
  providers: [uncorrectedNonCompliancesItemFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UncorrectedNonCompliancesItemFormComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = uncorrectedNonCompliancesMap;
  readonly isEditMode = !!this.formGroup.get('reference')?.value;

  onSubmit() {
    this.service
      .saveSubtask(
        UNCORRECTED_NON_COMPLIANCES_SUB_TASK,
        this.isEditMode ? UncorrectedNonCompliancesStep.ITEM_FORM_EDIT : UncorrectedNonCompliancesStep.ITEM_FORM_ADD,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
