import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { AerFuelConsumption, AerShipEmissions } from '@mrtm/api';

import { FeedbackBannerComponent, FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective, WarningTextComponent } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AER_SUBTASK_NEW_ENTRY_FLOW } from '@requests/common/aer/aer.consts';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AER_AGGREGATED_DATA_SUB_TASK,
  AerAggregatedDataWizardStep,
} from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data.helpers';
import { aerAggregatedDataSubtasksListMap } from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data-subtasks-list.map';
import { validateIfUsedFuelsExistInEmissionsValidator } from '@requests/common/aer/subtasks/utils';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { AerAggregatedDataShipSummaryTemplateComponent } from '@shared/components/summaries';
import { AerAggregatedDataShipSummary, AerPortSummaryItemDto, AerVoyageSummaryItemDto } from '@shared/types';
import { isNil } from '@shared/utils';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'mrtm-aer-aggregated-data-ship-summary',
  imports: [
    PageHeadingComponent,
    RouterLink,
    LinkDirective,
    ButtonDirective,
    PendingButtonDirective,
    AerAggregatedDataShipSummaryTemplateComponent,
    WarningTextComponent,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './aer-aggregated-data-ship-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerAggregatedDataShipSummaryComponent {
  readonly form = new UntypedFormGroup({});
  readonly dataId: InputSignal<string> = input<string>();
  readonly wizardMap = aerAggregatedDataSubtasksListMap;
  readonly warningMessages: Signal<Array<string>> = computed(() => {
    const warnings: Array<string> = [];
    const { fromFetch, relatedPorts, relatedVoyages, fuelConsumptions } = this.aggregatedData() ?? {};

    if (fromFetch && !relatedPorts.length && !relatedVoyages.length) {
      warnings.push(
        'No relevant data can be retrieved from the voyages or ports subtasks. Review the aggregated data and ensure that is correct.',
      );
    }

    if (!isNil(fuelConsumptions.find((fuel) => fuel.needsReview))) {
      warnings.push(
        'The highlighted fuel types have been updated due to changes made to the ‘Ships and emission details list’ subtask. Review the details for each fuel type, then select Confirm and continue.',
      );
    }

    return warnings;
  });
  private readonly feedbackBannerStore: FeedbackBannerStore = inject(FeedbackBannerStore);
  private readonly store = inject(RequestTaskStore);

  readonly isAddNewAggregatedData = inject(AER_SUBTASK_NEW_ENTRY_FLOW, { optional: true });
  readonly aggregatedData: Signal<
    AerAggregatedDataShipSummary & {
      status: TaskItemStatus;
      relatedPorts?: AerPortSummaryItemDto[];
      relatedShip: AerShipEmissions & { status: TaskItemStatus };
      relatedVoyages?: AerVoyageSummaryItemDto[];
    }
  > = computed(() => this.store.select(aerCommonQuery.selectAggregatedDataSummaryItem(this.dataId()))());
  readonly editable: Signal<boolean> = computed(() => {
    const aggregatedData = this.aggregatedData();
    return (
      !aggregatedData?.fromFetch &&
      aggregatedData?.dataInputType !== 'EXTERNAL_PROVIDER' &&
      this.store.select(requestTaskQuery.selectIsEditable)()
    );
  });

  readonly canSubmit: Signal<boolean> = computed(() => {
    const editable = this.store.select(requestTaskQuery.selectIsEditable)();
    const { status, fromFetch, relatedPorts, relatedVoyages } = this.aggregatedData() ?? {};

    if (!editable || status === TaskItemStatus.COMPLETED) {
      return false;
    }

    return (
      !fromFetch ||
      (fromFetch &&
        (relatedPorts?.length || relatedVoyages?.length) &&
        ((relatedPorts?.length && relatedPorts.every((port) => port?.status === TaskItemStatus.COMPLETED)) ||
          (relatedVoyages?.length && relatedVoyages.every((voyage) => voyage?.status === TaskItemStatus.COMPLETED))))
    );
  });
  readonly ship: Signal<AerShipEmissions> = computed(() =>
    this.store.select(aerCommonQuery.selectRelatedShipForAggregatedData(this.dataId()))(),
  );
  private readonly service: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly activatedRoute = inject(ActivatedRoute);

  onSubmit(): void {
    const { totalShipEmissions, surrenderEmissions, fuelConsumptions, relatedShip } = this.aggregatedData() ?? {};
    const errors: ValidationErrors =
      validateIfUsedFuelsExistInEmissionsValidator(fuelConsumptions as Array<AerFuelConsumption>, relatedShip) ?? {};
    let isValid = Object.keys(errors).length === 0;

    if (isNil(totalShipEmissions) || new BigNumber(totalShipEmissions).lt(0)) {
      errors['totalEmissions'] = 'The total ship emissions should be greater than or equal to 0';
      isValid = false;
    }

    if (!isNil(surrenderEmissions) && new BigNumber(surrenderEmissions).lt(0)) {
      errors['surrenderEmissions'] = 'The emissions figure for surrender should be greater than or equal to 0';
      isValid = false;
    }

    if (!isValid) {
      this.form.setErrors(errors);
      this.feedbackBannerStore.setInvalidForm(this.form);
      return;
    }

    this.service
      .saveSubtask(
        AER_AGGREGATED_DATA_SUB_TASK,
        this.isAddNewAggregatedData
          ? AerAggregatedDataWizardStep.NEW_AGGREGATED_DATA_SUMMARY
          : AerAggregatedDataWizardStep.AGGREGATED_DATA_SUMMARY,
        this.activatedRoute,
        this.dataId(),
      )
      .pipe(take(1))
      .subscribe();
  }
}
