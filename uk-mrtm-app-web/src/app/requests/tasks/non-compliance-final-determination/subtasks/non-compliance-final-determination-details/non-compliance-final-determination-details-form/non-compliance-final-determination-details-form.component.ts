import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import {
  ConditionalContentDirective,
  DateInputComponent,
  GovukSelectOption,
  RadioComponent,
  RadioOptionComponent,
  TextareaComponent,
} from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  NON_COMPLIANCE_FINAL_DETERMINATION_DETAILS_SUB_TASK,
  nonComplianceFinalDeterminationDetailsMap,
  NonComplianceFinalDeterminationDetailsStep,
  NonComplianceFinalDeterminationTaskPayload,
} from '@requests/common/non-compliance';
import { nonComplianceFinalDeterminationDetailsFormProvider } from '@requests/tasks/non-compliance-final-determination/subtasks/non-compliance-final-determination-details/non-compliance-final-determination-details-form/non-compliance-final-determination-details-form.form-provider';
import { WizardStepComponent } from '@shared/components';
import { NonComplianceReasonPipe } from '@shared/pipes';
import { NON_COMPLIANCE_REASON_TYPES, NonComplianceReason } from '@shared/types';

@Component({
  selector: 'mrtm-non-compliance-final-determination-details-form',
  imports: [
    ConditionalContentDirective,
    DateInputComponent,
    RadioComponent,
    RadioOptionComponent,
    TextareaComponent,
    ReactiveFormsModule,
    WizardStepComponent,
  ],
  standalone: true,
  templateUrl: './non-compliance-final-determination-details-form.component.html',
  providers: [nonComplianceFinalDeterminationDetailsFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonComplianceFinalDeterminationDetailsFormComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<NonComplianceFinalDeterminationTaskPayload>);
  readonly map = nonComplianceFinalDeterminationDetailsMap;
  private readonly nonComplianceReasonPipe = new NonComplianceReasonPipe();

  readonly reasonOptions: GovukSelectOption<NonComplianceReason>[] = NON_COMPLIANCE_REASON_TYPES.map((value) => ({
    value,
    text: this.nonComplianceReasonPipe.transform(value),
  }));

  onSubmit() {
    this.service
      .saveSubtask(
        NON_COMPLIANCE_FINAL_DETERMINATION_DETAILS_SUB_TASK,
        NonComplianceFinalDeterminationDetailsStep.DETAILS_FORM,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
