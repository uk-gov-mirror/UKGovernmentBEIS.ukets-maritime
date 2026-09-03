import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  UNCORRECTED_NON_CONFORMITIES_SUB_TASK,
  uncorrectedNonConformitiesMap,
  UncorrectedNonConformitiesStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { uncorrectedNonConformitiesPriorYearIssuesExistProvider } from '@requests/tasks/aer-verification-submit/subtasks/uncorrected-non-conformities/uncorrected-non-conformities-prior-year-issues-exist/uncorrected-non-conformities-prior-year-issues-exist.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-uncorrected-non-conformities-prior-year-issues-exist',
  imports: [RadioComponent, RadioOptionComponent, ReactiveFormsModule, WizardStepComponent],
  standalone: true,
  templateUrl: './uncorrected-non-conformities-prior-year-issues-exist.component.html',
  providers: [uncorrectedNonConformitiesPriorYearIssuesExistProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UncorrectedNonConformitiesPriorYearIssuesExistComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = uncorrectedNonConformitiesMap;

  onSubmit() {
    this.service
      .saveSubtask(
        UNCORRECTED_NON_CONFORMITIES_SUB_TASK,
        UncorrectedNonConformitiesStep.PRIOR_YEAR_ISSUES_EXIST_FORM,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
