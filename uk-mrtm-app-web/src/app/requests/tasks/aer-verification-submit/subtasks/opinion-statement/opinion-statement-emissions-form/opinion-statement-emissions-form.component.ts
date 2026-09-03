import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import {
  ConditionalContentDirective,
  RadioComponent,
  RadioOptionComponent,
  TextInputComponent,
} from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { OPINION_STATEMENT_SUB_TASK, opinionStatementMap, OpinionStatementStep } from '@requests/common/aer';
import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { opinionStatementEmissionsFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/opinion-statement/opinion-statement-emissions-form/opinion-statement-emissions-form.form-provider';
import { WizardStepComponent } from '@shared/components';
import { AerEmissionsOverviewSummaryTemplateComponent } from '@shared/components/summaries';

@Component({
  selector: 'mrtm-opinion-statement-emissions-form',
  imports: [
    ConditionalContentDirective,
    TextInputComponent,
    RadioComponent,
    RadioOptionComponent,
    ReactiveFormsModule,
    WizardStepComponent,
    AerEmissionsOverviewSummaryTemplateComponent,
  ],
  standalone: true,
  templateUrl: './opinion-statement-emissions-form.component.html',
  providers: [opinionStatementEmissionsFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpinionStatementEmissionsFormComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  private readonly store = inject(RequestTaskStore);
  readonly map = opinionStatementMap;
  readonly totalEmissions = this.store.select(aerCommonQuery.selectTotalEmissions);

  onSubmit() {
    this.service
      .saveSubtask(OPINION_STATEMENT_SUB_TASK, OpinionStatementStep.EMISSIONS_FORM, this.route, this.formGroup.value)
      .pipe(take(1))
      .subscribe();
  }
}
