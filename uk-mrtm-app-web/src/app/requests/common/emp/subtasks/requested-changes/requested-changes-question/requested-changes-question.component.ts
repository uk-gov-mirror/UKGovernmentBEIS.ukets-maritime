import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { EmissionsMonitoringPlan } from '@mrtm/api';

import { ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { CheckboxComponent, CheckboxesComponent } from '@netz/govuk-components';

import { EmpAmendTaskPayload } from '@requests/common/emp/emp.types';
import { AMENDS_NEEDED_GROUPS } from '@requests/common/emp/return-for-amends';
import {
  REQUESTED_CHANGES_SUB_TASK,
  RequestedChangesWizardStep,
} from '@requests/common/emp/subtasks/requested-changes/requested-changes.helpers';
import { requestedChangesQuestionComponentFormProvider } from '@requests/common/emp/subtasks/requested-changes/requested-changes-question/requested-changes-question.component.form-provider';
import { regulatorCommentsSubtaskMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { TASK_FORM } from '@requests/common/task-form.token';
import { ReviewReturnForAmendsSubtaskSummaryTemplateComponent, WizardStepComponent } from '@shared/components';
import { empSubtaskToTitle } from '@shared/constants';

@Component({
  selector: 'mrtm-requested-changes-question',
  imports: [
    ReturnToTaskOrActionPageComponent,
    CheckboxComponent,
    CheckboxesComponent,
    WizardStepComponent,
    ReactiveFormsModule,
    ReviewReturnForAmendsSubtaskSummaryTemplateComponent,
  ],
  standalone: true,
  templateUrl: './requested-changes-question.component.html',
  providers: [requestedChangesQuestionComponentFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestedChangesQuestionComponent {
  public readonly form = inject(TASK_FORM);
  private readonly service: TaskService<EmpAmendTaskPayload> = inject(TaskService<EmpAmendTaskPayload>);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  decisionForAmends = inject(AMENDS_NEEDED_GROUPS);
  headerTitle = regulatorCommentsSubtaskMap.requestedChanges.title;
  subtaskTitleMap: Record<keyof EmissionsMonitoringPlan, string> = empSubtaskToTitle;

  onSubmit() {
    this.service
      .saveSubtask(
        REQUESTED_CHANGES_SUB_TASK,
        RequestedChangesWizardStep.REQUESTED_CHANGES_AGREEMENT,
        this.route,
        this.form.value,
      )
      .subscribe();
  }
}
