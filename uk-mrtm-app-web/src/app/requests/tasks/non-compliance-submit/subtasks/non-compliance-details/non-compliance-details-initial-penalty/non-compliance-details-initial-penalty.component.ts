import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  NON_COMPLIANCE_DETAILS_SUB_TASK,
  nonComplianceDetailsMap,
  NonComplianceDetailsStep,
  NonComplianceSubmitTaskPayload,
} from '@requests/common/non-compliance';
import { nonComplianceDetailsInitialPenaltyProvider } from '@requests/tasks/non-compliance-submit/subtasks/non-compliance-details/non-compliance-details-initial-penalty/non-compliance-details-initial-penalty.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-non-compliance-details-initial-penalty',
  imports: [RadioComponent, RadioOptionComponent, ReactiveFormsModule, WizardStepComponent],
  standalone: true,
  templateUrl: './non-compliance-details-initial-penalty.component.html',
  providers: [nonComplianceDetailsInitialPenaltyProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonComplianceDetailsInitialPenaltyComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<NonComplianceSubmitTaskPayload>);
  readonly map = nonComplianceDetailsMap;

  onSubmit() {
    this.service
      .saveSubtask(
        NON_COMPLIANCE_DETAILS_SUB_TASK,
        NonComplianceDetailsStep.INITIAL_PENALTY,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
