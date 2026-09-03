import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { TextareaComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  UNCORRECTED_NON_CONFORMITIES_SUB_TASK,
  uncorrectedNonConformitiesMap,
  UncorrectedNonConformitiesStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { uncorrectedNonConformitiesPriorYearIssueFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/uncorrected-non-conformities/uncorrected-non-conformities-prior-year-issue-form/uncorrected-non-conformities-prior-year-issue-form.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-uncorrected-non-conformities-prior-year-issue-form',
  imports: [ReactiveFormsModule, TextareaComponent, WizardStepComponent],
  standalone: true,
  templateUrl: './uncorrected-non-conformities-prior-year-issue-form.component.html',
  providers: [uncorrectedNonConformitiesPriorYearIssueFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UncorrectedNonConformitiesPriorYearIssueFormComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = uncorrectedNonConformitiesMap;
  readonly isEditMode = !!this.formGroup.get('reference')?.value;

  onSubmit() {
    this.service
      .saveSubtask(
        UNCORRECTED_NON_CONFORMITIES_SUB_TASK,
        this.isEditMode
          ? UncorrectedNonConformitiesStep.PRIOR_YEAR_ISSUE_FORM_EDIT
          : UncorrectedNonConformitiesStep.PRIOR_YEAR_ISSUE_FORM_ADD,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
