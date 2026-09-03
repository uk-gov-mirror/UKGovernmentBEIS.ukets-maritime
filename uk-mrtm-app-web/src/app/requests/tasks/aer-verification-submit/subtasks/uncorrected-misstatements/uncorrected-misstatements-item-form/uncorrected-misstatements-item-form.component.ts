import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RadioComponent, RadioOptionComponent, TextareaComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  UNCORRECTED_MISSTATEMENTS_SUB_TASK,
  uncorrectedMisstatementsMap,
  UncorrectedMisstatementsStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { uncorrectedMisstatementsItemFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/uncorrected-misstatements/uncorrected-misstatements-item-form/uncorrected-misstatements-item-form.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-uncorrected-misstatements-item-form',
  imports: [RadioComponent, RadioOptionComponent, ReactiveFormsModule, TextareaComponent, WizardStepComponent],
  standalone: true,
  templateUrl: './uncorrected-misstatements-item-form.component.html',
  providers: [uncorrectedMisstatementsItemFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UncorrectedMisstatementsItemFormComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = uncorrectedMisstatementsMap;
  readonly isEditMode = !!this.formGroup.get('reference')?.value;

  onSubmit() {
    this.service
      .saveSubtask(
        UNCORRECTED_MISSTATEMENTS_SUB_TASK,
        this.isEditMode ? UncorrectedMisstatementsStep.ITEM_FORM_EDIT : UncorrectedMisstatementsStep.ITEM_FORM_ADD,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
