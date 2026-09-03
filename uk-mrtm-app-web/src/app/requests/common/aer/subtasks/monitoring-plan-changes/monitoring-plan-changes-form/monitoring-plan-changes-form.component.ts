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

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { monitoringPlanChangesMap } from '@requests/common/aer/subtasks/aer-subtasks-list.map';
import {
  MONITORING_PLAN_CHANGES_SUB_TASK,
  MonitoringPlanChangesWizardStep,
} from '@requests/common/aer/subtasks/monitoring-plan-changes/monitoring-plan-changes.helpers';
import { monitoringPlanChangesFormProvider } from '@requests/common/aer/subtasks/monitoring-plan-changes/monitoring-plan-changes-form/monitoring-plan-changes-form.form-provider';
import { TASK_FORM } from '@requests/common/task-form.token';
import { MonitoringPlanVersionSummaryTemplateComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-monitoring-plan-changes-form',
  imports: [
    ConditionalContentDirective,
    RadioComponent,
    RadioOptionComponent,
    ReactiveFormsModule,
    TextareaComponent,
    WizardStepComponent,
    MonitoringPlanVersionSummaryTemplateComponent,
  ],
  standalone: true,
  templateUrl: './monitoring-plan-changes-form.component.html',
  providers: [monitoringPlanChangesFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitoringPlanChangesFormComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);

  private readonly service = inject(TaskService<AerSubmitTaskPayload>);
  private readonly store = inject(RequestTaskStore);
  readonly map = monitoringPlanChangesMap;

  readonly monitoringPlanVersion = this.store.select(aerCommonQuery.selectMonitoringPlanVersion);

  onSubmit() {
    this.service
      .saveSubtask(
        MONITORING_PLAN_CHANGES_SUB_TASK,
        MonitoringPlanChangesWizardStep.FORM,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
