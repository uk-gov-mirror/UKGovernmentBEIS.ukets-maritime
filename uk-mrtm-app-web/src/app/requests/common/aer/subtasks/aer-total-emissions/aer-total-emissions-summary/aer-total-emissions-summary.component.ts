import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  FeedbackBannerComponent,
  FeedbackBannerStore,
  PageHeadingComponent,
  ReturnToTaskOrActionPageComponent,
} from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, WarningTextComponent } from '@netz/govuk-components';

import { aerTotalEmissionsMap } from '@requests/common/aer';
import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { AER_TOTAL_EMISSIONS_SUB_TASK } from '@requests/common/aer/subtasks/aer-total-emissions/aer-total-emissions.helpers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { AerTotalEmissionsSummaryTemplateComponent } from '@shared/components/summaries';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'mrtm-aer-total-emissions-summary',
  imports: [
    ButtonDirective,
    PageHeadingComponent,
    PendingButtonDirective,
    ReturnToTaskOrActionPageComponent,
    AerTotalEmissionsSummaryTemplateComponent,
    WarningTextComponent,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './aer-total-emissions-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerTotalEmissionsSummaryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(TaskService<AerSubmitTaskPayload>);
  private readonly store = inject(RequestTaskStore);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly form = new UntypedFormGroup({});

  private readonly hasNeedsReviewStatus: Signal<boolean> = computed(
    () => this.store.select(aerCommonQuery.selectStatusForTotalEmissions)() === TaskItemStatus.NEEDS_REVIEW,
  );
  private readonly hasInvalidSurrenderEmissions = computed(() =>
    new BigNumber(this.totalEmissions()?.surrenderEmissionsSummary).lt(0),
  );
  private readonly hasInvalidTotalShipEmissions = computed(() =>
    new BigNumber(this.totalEmissions()?.totalShipEmissionsSummary).lt(0),
  );

  readonly subtask = AER_TOTAL_EMISSIONS_SUB_TASK;
  readonly map = aerTotalEmissionsMap;
  readonly totalEmissions = this.store.select(aerCommonQuery.selectTotalEmissions);
  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable);
  readonly isSubtaskCompleted = this.store.select(aerCommonQuery.selectIsSubtaskCompleted(this.subtask));
  readonly warningText = computed(() => {
    if (this.hasInvalidSurrenderEmissions() || this.hasInvalidTotalShipEmissions()) {
      let message = '';
      if (this.hasInvalidTotalShipEmissions()) {
        message += 'The total maritime emissions should be greater than or equal to 0.\n';
      }
      if (this.hasInvalidSurrenderEmissions()) {
        message += 'The emissions figure for surrender should be greater than or equal to 0.\n';
      }
      return message;
    }
    if (this.hasNeedsReviewStatus()) {
      return 'Data has been updated due to changes to the other dependent subtasks. Review the updated information, then select Confirm and continue.';
    }
    return null;
  });

  constructor() {
    if (this.route.snapshot.queryParams?.['change'] === 'true') {
      this.router.navigate([], { queryParams: { change: null }, queryParamsHandling: 'merge', replaceUrl: true });
    }
  }

  onSubmit(): void {
    if (this.hasInvalidSurrenderEmissions() || this.hasInvalidTotalShipEmissions()) {
      const errors: ValidationErrors = {};

      if (this.hasInvalidTotalShipEmissions()) {
        errors['maritimeTotalEmissions'] = 'The total maritime emissions should be greater than or equal to 0';
      }
      if (this.hasInvalidSurrenderEmissions()) {
        errors['surrenderEmissions'] = 'The emissions figure for surrender should be greater than or equal to 0';
      }

      this.form.setErrors(errors);
      this.feedbackBannerStore.setInvalidForm(this.form);
      return;
    }

    this.service.submitSubtask(this.subtask, '../', this.route).subscribe();
  }
}
