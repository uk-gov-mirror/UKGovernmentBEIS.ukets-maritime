import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import {
  ConditionalContentDirective,
  RadioComponent,
  RadioOptionComponent,
  TextareaComponent,
} from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  NON_COMPLIANCE_DETAILS_SUB_TASK,
  nonComplianceDetailsMap,
  NonComplianceDetailsStep,
  NonComplianceSubmitTaskPayload,
} from '@requests/common/non-compliance';
import { nonComplianceDetailsCivilPenaltyProvider } from '@requests/tasks/non-compliance-submit/subtasks/non-compliance-details/non-compliance-details-civil-penalty/non-compliance-details-civil-penalty.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-non-compliance-details-civil-penalty',
  imports: [
    ConditionalContentDirective,
    RadioComponent,
    RadioOptionComponent,
    TextareaComponent,
    ReactiveFormsModule,
    WizardStepComponent,
  ],
  standalone: true,
  templateUrl: './non-compliance-details-civil-penalty.component.html',
  providers: [nonComplianceDetailsCivilPenaltyProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonComplianceDetailsCivilPenaltyComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<NonComplianceSubmitTaskPayload>);
  readonly map = nonComplianceDetailsMap;

  onSubmit() {
    this.service
      .saveSubtask(
        NON_COMPLIANCE_DETAILS_SUB_TASK,
        NonComplianceDetailsStep.CIVIL_PENALTY,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
