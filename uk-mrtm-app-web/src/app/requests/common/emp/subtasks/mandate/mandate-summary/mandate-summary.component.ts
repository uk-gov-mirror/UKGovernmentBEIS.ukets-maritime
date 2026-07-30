import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { EmpMandate, EmpOperatorDetails } from '@mrtm/api';

import {
  FeedbackBannerComponent,
  FeedbackBannerStore,
  PageHeadingComponent,
  ReturnToTaskOrActionPageComponent,
} from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import {
  empCommonQuery,
  empReviewQuery,
  empVariationRegulatorQuery,
  empVariationReviewQuery,
} from '@requests/common/emp/+state';
import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { MANDATE_SUB_TASK, MandateWizardStep } from '@requests/common/emp/subtasks/mandate/mandate.helper';
import { mandateMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { MandateSummaryTemplateComponent, ReviewDecisionSummaryTemplateComponent } from '@shared/components';
import { VariationRegulatorDecisionPartialSummaryTemplateComponent } from '@shared/components/summaries/variation-regulator-decision-partial-summary-template';
import { EmpVariationReviewDecisionDto } from '@shared/types';

@Component({
  selector: 'mrtm-mandate-summary',
  imports: [
    PageHeadingComponent,
    ReturnToTaskOrActionPageComponent,
    PendingButtonDirective,
    ButtonDirective,
    ReviewDecisionSummaryTemplateComponent,
    VariationRegulatorDecisionPartialSummaryTemplateComponent,
    MandateSummaryTemplateComponent,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './mandate-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MandateSummaryComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly service: TaskService<EmpTaskPayload> = inject(TaskService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly form = new UntypedFormGroup({});

  readonly wizardStep = MandateWizardStep;
  readonly wizardMap = mandateMap;
  readonly mandate: Signal<EmpMandate> = this.store.select(empCommonQuery.selectMandate);
  readonly originalMandate: Signal<EmpMandate> = this.store.select(empVariationRegulatorQuery.selectOriginalMandate);
  readonly operatorName: Signal<EmpOperatorDetails['operatorName']> = computed(
    () => this.store.select(empCommonQuery.selectOperatorDetails)()?.operatorName,
  );
  readonly originalOperatorName: Signal<EmpOperatorDetails['operatorName']> = computed(
    () => this.store.select(empVariationRegulatorQuery.selectOriginalOperatorDetails)()?.operatorName,
  );
  readonly isEditable: Signal<boolean> = this.store.select(requestTaskQuery.selectIsEditable);
  readonly hasReview: Signal<boolean> = this.store.select(empCommonQuery.selectHasReview);
  readonly isSubtaskCompleted: Signal<boolean> = computed(() =>
    this.hasReview()
      ? this.store.select(empReviewQuery.selectIsSubtaskCompleted(MANDATE_SUB_TASK))()
      : this.store.select(empCommonQuery.selectIsSubtaskCompleted(MANDATE_SUB_TASK))(),
  );
  readonly reviewDecision: Signal<EmpVariationReviewDecisionDto> = this.store.select(
    empVariationReviewQuery.selectEmpReviewDecisionDTO(MANDATE_SUB_TASK),
  );
  readonly variationDecisionDetails = this.store.select(
    empVariationRegulatorQuery.selectSubtaskVariationDecisionDetails(MANDATE_SUB_TASK),
  );
  readonly isVariationRegulatorDecision = this.store.select(empCommonQuery.selectIsVariationRegulator);

  onSubmit(): void {
    const ismShips = this.store.select(empCommonQuery.selectIsmShipImoNumbers)();

    if (!this.mandate().exist && ismShips.size > 0) {
      this.form.setErrors({
        ismShips:
          'The list of ships includes ships where the nature of responsibility lies with the ISM company, and no registered owner has been added. All relevant ships must be associated with a registered owner.',
      });

      this.feedbackBannerStore.setInvalidForm(this.form);
      return;
    }

    this.service
      .submitSubtask(MANDATE_SUB_TASK, this.wizardStep.SUMMARY, this.activatedRoute)
      .pipe(take(1))
      .subscribe();
  }
}
