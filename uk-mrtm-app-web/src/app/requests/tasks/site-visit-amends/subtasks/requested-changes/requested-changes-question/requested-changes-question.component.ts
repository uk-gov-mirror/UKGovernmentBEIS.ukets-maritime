import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { CheckboxComponent, CheckboxesComponent } from '@netz/govuk-components';

import { regulatorCommentsSubtaskMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { TASK_FORM } from '@requests/common/task-form.token';
import {
  REQUESTED_CHANGES_SUB_TASK,
  RequestedChangesWizardStep,
} from '@requests/tasks/site-visit-amends/subtasks/requested-changes/requested-changes.helpers';
import { requestedChangesQuestionFormProvider } from '@requests/tasks/site-visit-amends/subtasks/requested-changes/requested-changes-question/requested-changes-question.form.provider';
import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';
import { ReviewReturnForAmendsSubtaskSummaryTemplateComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-aer-requested-changes-question',
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
  providers: [requestedChangesQuestionFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestedChangesQuestionComponent {
  public readonly form = inject(TASK_FORM);
  private readonly store = inject(RequestTaskStore);
  private readonly service = inject(TaskService);
  private readonly route = inject(ActivatedRoute);

  readonly headerTitle = regulatorCommentsSubtaskMap.requestedChanges.title;
  readonly decisionForAmends = this.store.select(siteVisitReviewQuery.selectReviewDecisionDTO);
  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable);

  onSubmit(): void {
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
