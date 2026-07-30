import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { AerShipAggregatedData } from '@mrtm/api';

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

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AER_AGGREGATED_DATA_SUB_TASK,
  AerAggregatedDataWizardStep,
} from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data.helpers';
import { aerAggregatedDataSubtasksListMap } from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data-subtasks-list.map';
import { FilterByShip, FilterByShipComponent } from '@requests/common/components';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { PaginationStatePersistableComponent } from '@shared/abstraction';
import { AggregatedDataListSummaryTemplateComponent } from '@shared/components';
import { DropdownButtonGroupComponent, DropdownButtonItemComponent } from '@shared/components/dropdown-button-group';
import { PersistablePaginationState } from '@shared/services';
import { AerAggregatedDataSummaryItemDto, SubTaskListMap } from '@shared/types';
import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-aer-aggregated-data-list',
  imports: [
    ButtonDirective,
    PageHeadingComponent,
    DropdownButtonGroupComponent,
    DropdownButtonItemComponent,
    RouterLink,
    ReturnToTaskOrActionPageComponent,
    FilterByShipComponent,
    AggregatedDataListSummaryTemplateComponent,
    PendingButtonDirective,
    WarningTextComponent,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './aer-aggregated-data-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerAggregatedDataListComponent extends PaginationStatePersistableComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly service = inject(TaskService<AerSubmitTaskPayload>);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly formGroup = new UntypedFormGroup({});
  private readonly shipsWithoutAggregatedData = computed(() =>
    this.store
      .select(aerCommonQuery.selectListOfShipsWithoutAggregatedData(null))()
      .filter((ship) => ship.status === TaskItemStatus.COMPLETED),
  );
  private readonly aggregatedDataList = this.store.select(aerCommonQuery.selectAggregatedDataList);

  readonly filter = signal<FilterByShip | null>(
    this.currentPersistableComponentState()?.activeFilters as FilterByShip | null,
  );
  readonly editable: Signal<boolean> = this.store.select(requestTaskQuery.selectIsEditable);
  readonly shipsWithAggregatedData = this.store.select(aerCommonQuery.selectListOfShipsWithAggregatedData);
  readonly thirdPartyDataProviderName = this.store.select(aerCommonQuery.selectThirdPartyDataProviderName);
  readonly wizardMap: SubTaskListMap<AerShipAggregatedData> = aerAggregatedDataSubtasksListMap;
  readonly wizardStep = AerAggregatedDataWizardStep;

  readonly canFetchFromPortsAndVoyages = computed<boolean>(() =>
    [
      this.store.select(aerCommonQuery.selectStatusForVoyagesSubtask)(),
      this.store.select(aerCommonQuery.selectStatusForPortsSubtask)(),
    ].includes(TaskItemStatus.COMPLETED),
  );

  readonly hasExternalSystemData = computed(() => {
    return !!this.aggregatedDataList().find((data) => data.dataInputType === 'EXTERNAL_PROVIDER');
  });

  readonly filteredAggregatedDataList = computed<AerAggregatedDataSummaryItemDto[]>(() => {
    const imoNumber = this.filter()?.imoNumber;
    const allItems = this.aggregatedDataList();

    return isNil(imoNumber) ? allItems : allItems.filter((item) => item.imoNumber === imoNumber);
  });

  readonly aggregatedDataListHeader = computed<string>(() =>
    this.filter()?.shipName ? `Aggregated data of ${this.filter()?.shipName}` : 'Aggregated data of all ships',
  );

  private readonly noImoReferenceMessage = computed<string>(() => {
    const allShipsImoNumbers = this.store
      .select(aerCommonQuery.selectShips)()
      ?.map((ship) => ship?.details?.imoNumber);

    const isIncomplete = this.aggregatedDataList().some(
      (aggregatedDataItem) => !allShipsImoNumbers?.includes(aggregatedDataItem?.imoNumber),
    );
    return isIncomplete
      ? `Some aggregated data are not linked to ships in the 'Ships and emission details list' subtask. Check the Aggregated data list and make any changes needed.`
      : undefined;
  });

  private readonly needsReviewMessage = computed<string>(() => {
    const needsReviewAggregatedData = this.aggregatedDataList().filter(
      (aggregatedDataItem) => aggregatedDataItem.status === TaskItemStatus.NEEDS_REVIEW,
    );

    if (needsReviewAggregatedData.length === 0) {
      return undefined;
    }

    return needsReviewAggregatedData.find((data) => !data.canViewDetails)
      ? `Some aggregated data entries have ships with incomplete status. Confirm and complete the ship status from the 'Ships and emission details list' subtask, then review the aggregated data again.`
      : `The aggregated data has been updated due to changes made to the 'Ships and emission details list' subtask. Review the information for each aggregated data entry, then select Confirm and continue.`;
  });

  private readonly notCompletedMessage = computed<string>(() => {
    const hasIncompleteAggregatedData: boolean = this.aggregatedDataList().some(
      (aggregatedDataItem) => aggregatedDataItem.status === TaskItemStatus.IN_PROGRESS,
    );
    return hasIncompleteAggregatedData
      ? `Enter the missing details for all entries with the status 'Incomplete'`
      : undefined;
  });

  readonly warningMessages = computed<string[]>(() =>
    [this.noImoReferenceMessage(), this.needsReviewMessage(), this.notCompletedMessage()].filter((message) => message),
  );

  readonly canContinue = computed<boolean>(() => this.editable() && this.aggregatedDataList()?.length > 0);

  onFilterChanged({ imoNumber, shipName }: FilterByShip): void {
    this.filter.set({ imoNumber, shipName });
  }

  onDelete(aggregatedDataItems: Array<AerAggregatedDataSummaryItemDto>): void {
    if (aggregatedDataItems.length) {
      this.formGroup.reset();
      this.feedbackBannerStore.reset();

      this.service
        .saveSubtask(
          AER_AGGREGATED_DATA_SUB_TASK,
          AerAggregatedDataWizardStep.DELETE_AGGREGATED_DATA,
          this.activatedRoute,
          aggregatedDataItems,
        )
        .pipe(take(1))
        .subscribe();
    } else {
      this.formGroup.setErrors({ NONE_SELECTED: 'Select the aggregated data to delete' });
      this.feedbackBannerStore.setInvalidForm(this.formGroup);
    }
  }

  async onContinue(): Promise<void> {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (this.noImoReferenceMessage()) {
      errors['NO_IMO_REFERENCE'] = this.noImoReferenceMessage();
      isValid = false;
    }

    if (this.notCompletedMessage()) {
      errors['NOT_COMPLETED'] = this.notCompletedMessage();
      isValid = false;
    }

    if (this.needsReviewMessage()) {
      errors['NEEDS_REVIEW'] = this.needsReviewMessage();
      isValid = false;
    }

    if (!isValid) {
      this.formGroup.setErrors(errors);
      this.feedbackBannerStore.setInvalidForm(this.formGroup);
      return;
    }

    this.formGroup.reset();
    this.feedbackBannerStore.reset();

    await this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  onAddAggregatedData(): void {
    if (this.shipsWithoutAggregatedData().length === 0) {
      this.formGroup.setErrors({ notAllowed: 'All ships already have aggregated data recorded' });
      this.feedbackBannerStore.setInvalidForm(this.formGroup);
      return;
    }

    this.formGroup.reset();
    this.feedbackBannerStore.reset();

    this.router.navigate(['add', crypto.randomUUID(), this.wizardStep.SELECT_SHIP], {
      relativeTo: this.activatedRoute,
    });
  }

  public getExtraState(): Pick<PersistablePaginationState, 'currentSorting' | 'activeFilters'> {
    return {
      activeFilters: this.filter(),
    };
  }
}
