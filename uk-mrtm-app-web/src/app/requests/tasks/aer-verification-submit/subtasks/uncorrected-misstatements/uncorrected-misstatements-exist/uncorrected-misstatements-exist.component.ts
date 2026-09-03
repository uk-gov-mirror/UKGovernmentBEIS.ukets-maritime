import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  UNCORRECTED_MISSTATEMENTS_SUB_TASK,
  uncorrectedMisstatementsMap,
  UncorrectedMisstatementsStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { uncorrectedMisstatementsExistProvider } from '@requests/tasks/aer-verification-submit/subtasks/uncorrected-misstatements/uncorrected-misstatements-exist/uncorrected-misstatements-exist.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-uncorrected-misstatements-exist',
  imports: [RadioComponent, RadioOptionComponent, ReactiveFormsModule, WizardStepComponent],
  standalone: true,
  templateUrl: './uncorrected-misstatements-exist.component.html',
  providers: [uncorrectedMisstatementsExistProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UncorrectedMisstatementsExistComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = uncorrectedMisstatementsMap;

  onSubmit() {
    this.service
      .saveSubtask(
        UNCORRECTED_MISSTATEMENTS_SUB_TASK,
        UncorrectedMisstatementsStep.EXIST_FORM,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
