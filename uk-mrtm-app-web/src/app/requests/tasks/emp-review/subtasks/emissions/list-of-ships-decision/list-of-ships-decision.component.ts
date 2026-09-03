import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { FeedbackBannerComponent, FeedbackBannerStore } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective, WarningTextComponent } from '@netz/govuk-components';

import { empCommonQuery, EmpReviewTaskPayload, TaskItemStatus } from '@requests/common';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { EmissionsWizardStep } from '@requests/common/emp/subtasks/emissions/emissions.helpers';
import { emissionsSubTasksMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { transformWizardStepDecision } from '@requests/common/emp/utils/transform-wizard-step-decision';
import {
  REVIEW_DECISION_FORM,
  ReviewDecisionComponent,
  ReviewDecisionFormModel,
  reviewDecisionFormProvider,
} from '@requests/tasks/emp-review/components/review-decision';
import { EmpReviewService } from '@requests/tasks/emp-review/services';
import { WizardStepComponent } from '@shared/components';
import { ListOfShipsSummaryTemplateComponent } from '@shared/components/summaries';

@Component({
  selector: 'mrtm-list-of-ships-decision',
  imports: [
    ListOfShipsSummaryTemplateComponent,
    RouterLink,
    LinkDirective,
    ReactiveFormsModule,
    WizardStepComponent,
    ReviewDecisionComponent,
    FeedbackBannerComponent,
    ButtonDirective,
    WarningTextComponent,
  ],
  standalone: true,
  templateUrl: './list-of-ships-decision.component.html',
  providers: [reviewDecisionFormProvider(EMISSIONS_SUB_TASK)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListOfShipsDecisionComponent {
  protected readonly form: ReviewDecisionFormModel = inject(REVIEW_DECISION_FORM);

  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);

  private readonly service: TaskService<EmpReviewTaskPayload> = inject(TaskService<EmpReviewTaskPayload>);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly formGroup = new UntypedFormGroup({});

  readonly ships = this.store.select(empCommonQuery.selectListOfShips);
  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable);
  readonly wizardStep = transformWizardStepDecision(EmissionsWizardStep);
  readonly emissionsSubTasksMap = emissionsSubTasksMap;

  readonly notCompletedMessage = computed<string>(() => {
    const notCompleted: boolean = this.ships()?.some((ship) => ship.status !== TaskItemStatus.COMPLETED);
    return notCompleted ? 'Enter the missing details for all entries with the status ‘Incomplete’' : undefined;
  });

  onContinueAttempt() {
    if (this.notCompletedMessage()) {
      this.formGroup.setErrors({ NOT_COMPLETED: this.notCompletedMessage() });
      this.feedbackBannerStore.setInvalidForm(this.formGroup);
    } else {
      this.formGroup.reset();
      this.feedbackBannerStore.reset();
    }
  }

  onSubmit() {
    this.feedbackBannerStore.reset();

    (this.service as EmpReviewService)
      .saveReviewDecision(
        EMISSIONS_SUB_TASK,
        EmissionsWizardStep.DECISION,
        this.route,
        this.form.value,
        subtaskReviewGroupMap[EMISSIONS_SUB_TASK],
      )
      .subscribe();
  }
}
