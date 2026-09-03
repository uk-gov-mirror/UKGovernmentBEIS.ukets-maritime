import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { EmpVariationDetails } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { empVariationQuery } from '@requests/common/emp/+state';
import { EmpVariationReviewTaskPayload } from '@requests/common/emp/emp.types';
import { variationDetailsSubtaskMap } from '@requests/common/emp/subtasks/subtask-list.map';
import {
  VARIATION_DETAILS_SUB_TASK,
  VariationDetailsWizardStep,
} from '@requests/common/emp/subtasks/variation-details/variation-details.helper';
import { transformWizardStepDecision } from '@requests/common/emp/utils/transform-wizard-step-decision';
import {
  ReviewDecisionComponent,
  ReviewDecisionFormModel,
  reviewEmpVariationDetailsDecisionFormProvider,
  VARIATION_REVIEW_DECISION_FORM,
} from '@requests/tasks/emp-variation-review/components';
import { EmpVariationReviewService } from '@requests/tasks/emp-variation-review/services';
import { VariationDetailsSummaryTemplateComponent, WizardStepComponent } from '@shared/components';
import { SubTaskListMap } from '@shared/types';

interface ViewModel {
  variationDetails: EmpVariationDetails;
  variationDetailsMap: SubTaskListMap<EmpVariationDetails & { decision: string }>;
  isEditable: boolean;
  wizardStep: { [s: string]: string };
}

@Component({
  selector: 'mrtm-review-variation-details',
  imports: [
    WizardStepComponent,
    ReactiveFormsModule,
    VariationDetailsSummaryTemplateComponent,
    ReviewDecisionComponent,
  ],
  standalone: true,
  templateUrl: './variation-details-decision.component.html',
  providers: [reviewEmpVariationDetailsDecisionFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariationDetailsDecisionComponent {
  protected readonly form: ReviewDecisionFormModel = inject(VARIATION_REVIEW_DECISION_FORM);

  private readonly service: TaskService<EmpVariationReviewTaskPayload> = inject(
    TaskService<EmpVariationReviewTaskPayload>,
  );
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  readonly vm: Signal<ViewModel> = computed(() => {
    return {
      variationDetails: this.store.select(empVariationQuery.selectEmpVariationDetails)(),
      variationDetailsMap: variationDetailsSubtaskMap,
      isEditable: this.store.select(requestTaskQuery.selectIsEditable)(),
      wizardStep: transformWizardStepDecision(VariationDetailsWizardStep),
    };
  });

  onSubmit() {
    (this.service as EmpVariationReviewService)
      .saveVariationDetailsReviewDecision(
        VARIATION_DETAILS_SUB_TASK,
        VariationDetailsWizardStep.DECISION,
        this.route,
        this.form.value,
      )
      .subscribe();
  }
}
