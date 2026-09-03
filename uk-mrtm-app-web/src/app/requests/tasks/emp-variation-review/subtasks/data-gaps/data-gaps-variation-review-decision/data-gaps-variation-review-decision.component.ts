import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { EmpDataGaps } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { empCommonQuery, empVariationReviewQuery } from '@requests/common/emp/+state';
import { EmpVariationReviewTaskPayload } from '@requests/common/emp/emp.types';
import { DATA_GAPS_SUB_TASK, DataGapsWizardStep } from '@requests/common/emp/subtasks/data-gaps';
import { dataGapsMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { transformWizardStepDecision } from '@requests/common/emp/utils/transform-wizard-step-decision';
import {
  ReviewDecisionComponent,
  ReviewDecisionFormModel,
  reviewEmpSubtaskDecisionFormProvider,
  VARIATION_REVIEW_DECISION_FORM,
} from '@requests/tasks/emp-variation-review/components/review-decision';
import { EmpVariationReviewService } from '@requests/tasks/emp-variation-review/services';
import { DataGapsSummaryTemplateComponent, WizardStepComponent } from '@shared/components';
import { SubTaskListMap } from '@shared/types';

interface ViewModel {
  dataGaps: EmpDataGaps;
  originalDataGaps: EmpDataGaps;
  dataGapsMap: SubTaskListMap<{ dataGapsMethod: string; decision: string }>;
  isEditable: boolean;
  wizardStep: { [s: string]: string };
}

@Component({
  selector: 'mrtm-data-gaps-variation-review-decision',
  imports: [DataGapsSummaryTemplateComponent, WizardStepComponent, ReviewDecisionComponent, ReactiveFormsModule],
  standalone: true,
  templateUrl: './data-gaps-variation-review-decision.component.html',
  providers: [reviewEmpSubtaskDecisionFormProvider(DATA_GAPS_SUB_TASK)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGapsVariationReviewDecisionComponent {
  protected readonly form: ReviewDecisionFormModel = inject(VARIATION_REVIEW_DECISION_FORM);
  private readonly service: TaskService<EmpVariationReviewTaskPayload> = inject(
    TaskService<EmpVariationReviewTaskPayload>,
  );
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  readonly vm: Signal<ViewModel> = computed(() => ({
    dataGaps: this.store.select(empCommonQuery.selectDataGaps)(),
    originalDataGaps: this.store.select(empVariationReviewQuery.selectOriginalDataGaps)(),
    dataGapsMap: dataGapsMap,
    isEditable: this.store.select(requestTaskQuery.selectIsEditable)(),
    wizardStep: transformWizardStepDecision(DataGapsWizardStep),
  }));

  onSubmit() {
    (this.service as EmpVariationReviewService)
      .saveReviewDecision(
        DATA_GAPS_SUB_TASK,
        DataGapsWizardStep.DECISION,
        this.route,
        this.form.value,
        subtaskReviewGroupMap[DATA_GAPS_SUB_TASK],
      )
      .subscribe();
  }
}
