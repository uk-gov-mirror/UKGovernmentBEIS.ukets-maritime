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
import { nonComplianceDetailsNoticeOfIntentProvider } from '@requests/tasks/non-compliance-submit/subtasks/non-compliance-details/non-compliance-details-notice-of-intent/non-compliance-details-notice-of-intent.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-non-compliance-details-notice-of-intent',
  imports: [RadioComponent, RadioOptionComponent, ReactiveFormsModule, WizardStepComponent],
  standalone: true,
  templateUrl: './non-compliance-details-notice-of-intent.component.html',
  providers: [nonComplianceDetailsNoticeOfIntentProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonComplianceDetailsNoticeOfIntentComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<NonComplianceSubmitTaskPayload>);
  readonly map = nonComplianceDetailsMap;

  onSubmit() {
    this.service
      .saveSubtask(
        NON_COMPLIANCE_DETAILS_SUB_TASK,
        NonComplianceDetailsStep.NOTICE_OF_INTENT,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
