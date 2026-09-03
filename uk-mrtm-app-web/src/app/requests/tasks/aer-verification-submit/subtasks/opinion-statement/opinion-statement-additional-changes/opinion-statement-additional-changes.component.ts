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
  TextareaComponent,
} from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { OPINION_STATEMENT_SUB_TASK, opinionStatementMap, OpinionStatementStep } from '@requests/common/aer';
import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { opinionStatementAdditionalChangesFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/opinion-statement/opinion-statement-additional-changes/opinion-statement-additional-changes.form-provider';
import { MonitoringPlanChangesSummaryTemplateComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-opinion-statement-additional-changes',
  imports: [
    ConditionalContentDirective,
    RadioComponent,
    RadioOptionComponent,
    ReactiveFormsModule,
    TextareaComponent,
    WizardStepComponent,
    MonitoringPlanChangesSummaryTemplateComponent,
  ],
  standalone: true,
  templateUrl: './opinion-statement-additional-changes.component.html',
  providers: [opinionStatementAdditionalChangesFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpinionStatementAdditionalChangesComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  private readonly store = inject(RequestTaskStore);
  readonly map = opinionStatementMap;

  readonly monitoringPlanVersion = this.store.select(aerCommonQuery.selectMonitoringPlanVersion);
  readonly monitoringPlanChanges = this.store.select(aerCommonQuery.selectMonitoringPlanChanges);

  onSubmit() {
    this.service
      .saveSubtask(
        OPINION_STATEMENT_SUB_TASK,
        OpinionStatementStep.ADDITIONAL_CHANGES,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
