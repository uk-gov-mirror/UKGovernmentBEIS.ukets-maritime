import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { EmpMonitoringGreenhouseGas } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { empCommonQuery, empVariationReviewQuery } from '@requests/common/emp/+state';
import { EmpVariationReviewTaskPayload } from '@requests/common/emp/emp.types';
import { GREENHOUSE_GAS_SUB_TASK, GreenhouseGasWizardStep } from '@requests/common/emp/subtasks/greenhouse-gas';
import { greenhouseGasMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { transformWizardStepDecision } from '@requests/common/emp/utils/transform-wizard-step-decision';
import {
  ReviewDecisionComponent,
  ReviewDecisionFormModel,
  reviewEmpSubtaskDecisionFormProvider,
  VARIATION_REVIEW_DECISION_FORM,
} from '@requests/tasks/emp-variation-review/components/review-decision';
import { EmpVariationReviewService } from '@requests/tasks/emp-variation-review/services';
import { GreenhousesSummaryTemplateComponent, WizardStepComponent } from '@shared/components';
import { SubTaskListMap } from '@shared/types';

interface ViewModel {
  greenhouseGas: EmpMonitoringGreenhouseGas;
  originalGreenhouseGas: EmpMonitoringGreenhouseGas;
  greenhouseGasMap: SubTaskListMap<EmpMonitoringGreenhouseGas & { decision: string }>;
  isEditable: boolean;
  wizardStep?: { [s: string]: string };
}

@Component({
  selector: 'mrtm-greenhouse-gas-variation-review-decision',
  imports: [GreenhousesSummaryTemplateComponent, ReactiveFormsModule, WizardStepComponent, ReviewDecisionComponent],
  standalone: true,
  templateUrl: './greenhouse-gas-variation-review-decision.component.html',
  providers: [reviewEmpSubtaskDecisionFormProvider(GREENHOUSE_GAS_SUB_TASK)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GreenhouseGasVariationReviewDecisionComponent {
  protected readonly form: ReviewDecisionFormModel = inject(VARIATION_REVIEW_DECISION_FORM);
  private readonly service: TaskService<EmpVariationReviewTaskPayload> = inject(
    TaskService<EmpVariationReviewTaskPayload>,
  );
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  readonly vm: Signal<ViewModel> = computed(() => ({
    greenhouseGas: this.store.select(empCommonQuery.selectGreenhouseGas)(),
    originalGreenhouseGas: this.store.select(empVariationReviewQuery.selectOriginalGreenhouseGas)(),
    greenhouseGasMap: greenhouseGasMap,
    isEditable: this.store.select(requestTaskQuery.selectIsEditable)(),
    wizardStep: transformWizardStepDecision(GreenhouseGasWizardStep),
  }));

  onSubmit() {
    (this.service as EmpVariationReviewService)
      .saveReviewDecision(
        GREENHOUSE_GAS_SUB_TASK,
        GreenhouseGasWizardStep.DECISION,
        this.route,
        this.form.value,
        subtaskReviewGroupMap[GREENHOUSE_GAS_SUB_TASK],
      )
      .subscribe();
  }
}
