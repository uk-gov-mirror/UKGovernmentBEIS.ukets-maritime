import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import {
  ConditionalContentDirective,
  DetailsComponent,
  LinkDirective,
  RadioComponent,
  RadioOptionComponent,
  TextareaComponent,
} from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { ETS_COMPLIANCE_RULES_SUB_TASK, etsComplianceRulesMap, EtsComplianceRulesStep } from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { etsComplianceRulesFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/ets-compliance-rules/ets-compliance-rules-form/ets-compliance-rules-form.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-ets-compliance-rules-form',
  imports: [
    ConditionalContentDirective,
    DetailsComponent,
    LinkDirective,
    TextareaComponent,
    RadioComponent,
    RadioOptionComponent,
    ReactiveFormsModule,
    WizardStepComponent,
  ],
  standalone: true,
  templateUrl: './ets-compliance-rules-form.component.html',
  providers: [etsComplianceRulesFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtsComplianceRulesFormComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = etsComplianceRulesMap;

  onSubmit() {
    this.service
      .saveSubtask(ETS_COMPLIANCE_RULES_SUB_TASK, EtsComplianceRulesStep.FORM, this.route, this.formGroup.value)
      .pipe(take(1))
      .subscribe();
  }
}
