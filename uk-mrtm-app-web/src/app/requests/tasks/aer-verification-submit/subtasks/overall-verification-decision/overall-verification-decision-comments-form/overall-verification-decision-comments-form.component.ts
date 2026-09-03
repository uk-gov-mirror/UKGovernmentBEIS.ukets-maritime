import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { TextareaComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  OVERALL_VERIFICATION_DECISION_SUB_TASK,
  overallVerificationDecisionMap,
  OverallVerificationDecisionStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { overallVerificationDecisionCommentsFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/overall-verification-decision/overall-verification-decision-comments-form/overall-verification-decision-comments-form.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-overall-verification-decision-comments-form',
  imports: [ReactiveFormsModule, TextareaComponent, WizardStepComponent],
  standalone: true,
  templateUrl: './overall-verification-decision-comments-form.component.html',
  providers: [overallVerificationDecisionCommentsFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverallVerificationDecisionCommentsFormComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = overallVerificationDecisionMap;
  readonly isEditMode = !!this.formGroup.get('reasonIndex')?.value;

  onSubmit() {
    this.service
      .saveSubtask(
        OVERALL_VERIFICATION_DECISION_SUB_TASK,
        this.isEditMode
          ? OverallVerificationDecisionStep.VERIFIED_WITH_COMMENTS_FORM_EDIT
          : OverallVerificationDecisionStep.VERIFIED_WITH_COMMENTS_FORM_ADD,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
