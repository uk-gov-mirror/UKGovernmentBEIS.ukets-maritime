import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TaskService } from '@netz/common/forms';
import { TextareaComponent } from '@netz/govuk-components';

import { OPERATOR_DETAILS_SUB_TASK, OperatorDetailsWizardStep } from '@requests/common/components/operator-details';
import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { undertakenActivitiesFormProvider } from '@requests/common/emp/subtasks/operator-details/undertaken-activities/undertaken-activities.form-provider';
import { identifyMaritimeOperatorMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { TASK_FORM } from '@requests/common/task-form.token';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-undertaken-activities',
  imports: [ReactiveFormsModule, WizardStepComponent, TextareaComponent],
  standalone: true,
  templateUrl: './undertaken-activities.component.html',
  providers: [undertakenActivitiesFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndertakenActivitiesComponent {
  public readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly service: TaskService<EmpTaskPayload> = inject(TaskService<EmpTaskPayload>);
  private readonly route = inject(ActivatedRoute);

  public readonly identifyMaritimeOperatorMap = identifyMaritimeOperatorMap;

  onSubmit() {
    this.service
      .saveSubtask(
        OPERATOR_DETAILS_SUB_TASK,
        OperatorDetailsWizardStep.OPERATOR_DETAILS_UNDERTAKEN_ACTIVITIES,
        this.route,
        this.formGroup.value,
      )
      .subscribe();
  }
}
