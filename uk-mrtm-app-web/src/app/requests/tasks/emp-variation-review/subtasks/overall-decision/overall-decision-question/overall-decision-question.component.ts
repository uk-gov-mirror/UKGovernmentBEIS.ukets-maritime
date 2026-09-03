import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { TextareaComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { empVariationReviewQuery } from '@requests/common/emp/+state';
import { EmpVariationReviewTaskPayload } from '@requests/common/emp/emp.types';
import {
  OVERALL_DECISION_SUB_TASK,
  overallDecisionMap,
  OverallDecisionWizardStep,
} from '@requests/common/emp/subtasks/overall-decision';
import { EmpVariationReviewService } from '@requests/tasks/emp-variation-review/services';
import { overallDecisionQuestionFormProvider } from '@requests/tasks/emp-variation-review/subtasks/overall-decision/overall-decision-question/overall-decision-question.form-provider';
import { WizardStepComponent } from '@shared/components';
import { DeterminationTypePipe, VariationDeterminationHeaderTypePipe } from '@shared/pipes';

@Component({
  selector: 'mrtm-overall-decision-question',
  imports: [
    WizardStepComponent,
    DeterminationTypePipe,
    ReactiveFormsModule,
    TextareaComponent,
    VariationDeterminationHeaderTypePipe,
  ],
  standalone: true,
  templateUrl: './overall-decision-question.component.html',
  providers: [overallDecisionQuestionFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverallDecisionQuestionComponent {
  protected readonly form = inject(TASK_FORM);
  private readonly service: TaskService<EmpVariationReviewTaskPayload> = inject(
    TaskService<EmpVariationReviewTaskPayload>,
  );
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  protected readonly overallDecisionMap = overallDecisionMap;
  public readonly determinationType = this.store.select(empVariationReviewQuery.selectDetermination)()?.type;

  onSubmit() {
    (this.service as EmpVariationReviewService)
      .saveReviewDetermination(
        OVERALL_DECISION_SUB_TASK,
        OverallDecisionWizardStep.OVERALL_DECISION_QUESTION,
        this.route,
        this.form.value,
      )
      .subscribe();
  }
}
