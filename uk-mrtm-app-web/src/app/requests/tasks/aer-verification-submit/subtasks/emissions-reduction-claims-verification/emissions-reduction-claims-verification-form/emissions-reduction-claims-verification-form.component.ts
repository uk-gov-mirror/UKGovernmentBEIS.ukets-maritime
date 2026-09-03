import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  EMISSIONS_REDUCTION_CLAIMS_VERIFICATION_SUB_TASK,
  EmissionsReductionClaimsVerificationStep,
  emissionsReductionClaimVerificationSubtaskListMap,
} from '@requests/common/aer/subtasks/emissions-reduction-claim-verification';
import { emissionsReductionClaimsVerificationFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/emissions-reduction-claims-verification/emissions-reduction-claims-verification-form/emissions-reduction-claims-verification-form.provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-emissions-reduction-claims-verification-form',
  imports: [
    WizardStepComponent,
    ReactiveFormsModule,
    RadioComponent,
    RadioOptionComponent,
    TextareaComponent,
    ConditionalContentDirective,
  ],
  standalone: true,
  templateUrl: './emissions-reduction-claims-verification-form.component.html',
  providers: [emissionsReductionClaimsVerificationFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmissionsReductionClaimsVerificationFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);

  readonly formGroup = inject(TASK_FORM);
  readonly map = emissionsReductionClaimVerificationSubtaskListMap;

  onSubmit() {
    this.service
      .saveSubtask(
        EMISSIONS_REDUCTION_CLAIMS_VERIFICATION_SUB_TASK,
        EmissionsReductionClaimsVerificationStep.FORM,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
