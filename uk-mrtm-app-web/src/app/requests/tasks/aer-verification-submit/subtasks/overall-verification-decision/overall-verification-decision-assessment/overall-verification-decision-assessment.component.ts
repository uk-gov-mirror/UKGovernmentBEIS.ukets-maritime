import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { AerVerificationDecision } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  OVERALL_VERIFICATION_DECISION_SUB_TASK,
  overallVerificationDecisionMap,
  OverallVerificationDecisionStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { overallVerificationDecisionAssessmentProvider } from '@requests/tasks/aer-verification-submit/subtasks/overall-verification-decision/overall-verification-decision-assessment/overall-verification-decision-assessment.form-provider';
import { WizardStepComponent } from '@shared/components';
import { OverallVerificationDecisionPipe } from '@shared/pipes';

@Component({
  selector: 'mrtm-overall-verification-decision-assessment',
  imports: [
    RadioComponent,
    RadioOptionComponent,
    ReactiveFormsModule,
    WizardStepComponent,
    OverallVerificationDecisionPipe,
  ],
  standalone: true,
  templateUrl: './overall-verification-decision-assessment.component.html',
  providers: [overallVerificationDecisionAssessmentProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverallVerificationDecisionAssessmentComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = overallVerificationDecisionMap;

  readonly options: AerVerificationDecision['type'][] = [
    'VERIFIED_AS_SATISFACTORY',
    'VERIFIED_AS_SATISFACTORY_WITH_COMMENTS',
    'NOT_VERIFIED',
  ];

  onSubmit() {
    this.service
      .saveSubtask(
        OVERALL_VERIFICATION_DECISION_SUB_TASK,
        OverallVerificationDecisionStep.ASSESSMENT,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
