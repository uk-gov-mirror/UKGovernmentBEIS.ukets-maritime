import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EmpVariationDetails } from '@mrtm/api';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { OperatorDetailsWizardStep } from '@requests/common/components/operator-details';
import { empVariationQuery, empVariationReviewQuery } from '@requests/common/emp/+state';
import { EmpVariationReviewTaskPayload } from '@requests/common/emp/emp.types';
import { variationDetailsSubtaskMap } from '@requests/common/emp/subtasks/subtask-list.map';
import {
  VARIATION_DETAILS_SUB_TASK,
  VariationDetailsWizardStep,
} from '@requests/common/emp/subtasks/variation-details/variation-details.helper';
import { ReviewDecisionSummaryTemplateComponent, VariationDetailsSummaryTemplateComponent } from '@shared/components';
import { EmpVariationReviewDecisionDto, SubTaskListMap } from '@shared/types';

interface ViewModel {
  variationDetails: EmpVariationDetails;
  variationDetailsMap: SubTaskListMap<{ decision: string }>;
  empReviewDecisionDTO: EmpVariationReviewDecisionDto;
  isEditable: boolean;
  isSubTaskCompleted: boolean;
  showDecisionDetails: boolean;
  wizardStep: { [s: string]: string };
}

@Component({
  selector: 'mrtm-review-variation-details-summary',
  imports: [
    PageHeadingComponent,
    VariationDetailsSummaryTemplateComponent,
    PendingButtonDirective,
    ButtonDirective,
    ReturnToTaskOrActionPageComponent,
    ReviewDecisionSummaryTemplateComponent,
  ],
  standalone: true,
  templateUrl: './variation-details-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariationDetailsSummaryComponent {
  private readonly service: TaskService<EmpVariationReviewTaskPayload> = inject(
    TaskService<EmpVariationReviewTaskPayload>,
  );
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  readonly vm: Signal<ViewModel> = computed(() => {
    const empVariationDetails = this.store.select(empVariationQuery.selectEmpVariationDetails)();

    return {
      variationDetails: empVariationDetails,
      variationDetailsMap: variationDetailsSubtaskMap,
      empReviewDecisionDTO: this.store.select(empVariationReviewQuery.selectEmpVariationDetailsReviewDecisionDTO)(),
      isEditable: this.store.select(requestTaskQuery.selectIsEditable)(),
      isSubTaskCompleted: this.store.select(empVariationReviewQuery.selectIsVariationReviewDetailsSubtaskCompleted)(),
      showDecisionDetails:
        this.store.select(requestTaskQuery.selectRequestTaskType)() !== 'EMP_VARIATION_WAIT_FOR_AMENDS',
      wizardStep: VariationDetailsWizardStep,
    };
  });

  onSubmit() {
    this.service.submitSubtask(VARIATION_DETAILS_SUB_TASK, OperatorDetailsWizardStep.SUMMARY, this.route).subscribe();
  }
}
