import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { take } from 'rxjs';

import {
  FeedbackBannerComponent,
  FeedbackBannerStore,
  PageHeadingComponent,
  ReturnToTaskOrActionPageComponent,
} from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AER_VOYAGES_SUB_TASK,
  AerVoyagesWizardStep,
} from '@requests/common/aer/subtasks/aer-voyages/aer-voyages.helpers';
import { aerVoyagesMap } from '@requests/common/aer/subtasks/aer-voyages/aer-voyages-subtask-list.map';
import { FilterByShipAndDateRange, FilterByShipAndDateRangeComponent } from '@requests/common/components';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { PaginationStatePersistableComponent } from '@shared/abstraction';
import { VoyagesListSummaryTemplateComponent } from '@shared/components';
import { PersistablePaginationState } from '@shared/services';
import { AerVoyageSummaryItemDto } from '@shared/types';
import { isSameDayOrAfter, isSameDayOrBefore } from '@shared/utils/dates.utils';

@Component({
  selector: 'mrtm-aer-voyages-list',
  imports: [
    PageHeadingComponent,
    LinkDirective,
    ButtonDirective,
    RouterLink,
    ReturnToTaskOrActionPageComponent,
    ReactiveFormsModule,
    VoyagesListSummaryTemplateComponent,
    PendingButtonDirective,
    FilterByShipAndDateRangeComponent,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './aer-voyages-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerVoyagesListComponent extends PaginationStatePersistableComponent {
  private readonly formGroup = new UntypedFormGroup({});
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly store = inject(RequestTaskStore);
  private readonly service: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly allVoyages = this.store.select(aerCommonQuery.selectVoyagesList);
  private readonly filter = signal<FilterByShipAndDateRange>(
    (this.currentPersistableComponentState()?.activeFilters as FilterByShipAndDateRange) ?? null,
  );

  readonly randomUUID = signal(crypto.randomUUID());
  readonly editable: Signal<boolean> = this.store.select(requestTaskQuery.selectIsEditable);
  readonly wizardMap = aerVoyagesMap;
  readonly wizardStep = AerVoyagesWizardStep;
  readonly shipsWithVoyages = this.store.select(aerCommonQuery.selectListOfShipsWithVoyages);

  readonly filteredVoyages = computed<AerVoyageSummaryItemDto[]>(() => {
    const filteredByShip = this.filter()?.imoNumber
      ? this.allVoyages().filter((voyage) => voyage.imoNumber === this.filter()?.imoNumber)
      : this.allVoyages();

    if (this.filter()?.arrivalDate && this.filter()?.departureDate) {
      // find all the voyages within arrivalDate - departureDate range
      return filteredByShip.filter(
        (voyage) =>
          isSameDayOrAfter(new Date(voyage.departureTime), this.filter()?.departureDate) &&
          isSameDayOrBefore(new Date(voyage.arrivalTime), this.filter()?.arrivalDate),
      );
    }
    return filteredByShip;
  });

  readonly voyagesListHeader = computed<string>(() =>
    this.filter()?.shipName ? `Voyages of ${this.filter()?.shipName}` : 'Voyages of all ships',
  );

  readonly canContinue = computed<boolean>(() => this.editable() && this.allVoyages()?.length > 0);

  private readonly noImoReferenceMessage = computed<string>(() => {
    const allShipsImoNumbers = this.store
      .select(aerCommonQuery.selectShips)()
      ?.map((ship) => ship?.details?.imoNumber);

    const isIncomplete = this.allVoyages().some((voyage) => !allShipsImoNumbers?.includes(voyage?.imoNumber));
    return isIncomplete
      ? `Some voyages are not linked to ships in the 'Ships and emission details list' subtask. Check the Voyages list and make any changes needed.`
      : undefined;
  });

  private readonly needsReviewMessage = computed<string>(() => {
    const needsReviewVoyages = this.allVoyages().filter((voyage) => voyage.status === TaskItemStatus.NEEDS_REVIEW);

    if (needsReviewVoyages.length === 0) {
      return undefined;
    }

    return needsReviewVoyages.find((voyage) => !voyage.canViewDetails)
      ? `Some voyages have ships with incomplete status. Confirm and complete the ship status from the 'Ships and emission details list' subtask, then review the voyage again.`
      : `The voyage and emission details have been updated due to changes made to the 'Ships and emission details list' subtask. Review the information for each voyage, then select Confirm and continue.`;
  });

  private readonly notCompletedMessage = computed<string>(() => {
    const isIncomplete = this.allVoyages().some((voyage) => voyage.status === TaskItemStatus.IN_PROGRESS);
    return isIncomplete ? `Enter the missing details for all entries with the status 'Incomplete'` : undefined;
  });

  readonly warningMessages = computed<string[]>(() =>
    [this.noImoReferenceMessage(), this.needsReviewMessage(), this.notCompletedMessage()].filter((message) => message),
  );

  readonly emptyTableText = computed<string>(() =>
    this.allVoyages()?.length > this.filteredVoyages()?.length
      ? 'There are no matching results'
      : 'No items to display',
  );

  onFilterChanged(filterValue: FilterByShipAndDateRange): void {
    this.filter.set(filterValue);
  }

  onDelete(voyages: Array<AerVoyageSummaryItemDto>): void {
    if (voyages.length) {
      this.formGroup.reset();
      this.feedbackBannerStore.reset();

      this.service
        .saveSubtask(AER_VOYAGES_SUB_TASK, AerVoyagesWizardStep.DELETE_VOYAGE, this.activatedRoute, voyages)
        .pipe(take(1))
        .subscribe();
    } else {
      this.formGroup.setErrors({ NONE_SELECTED: 'Select the voyages to delete' });
      this.feedbackBannerStore.setInvalidForm(this.formGroup);
    }
  }

  onContinue(): void {
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

    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  public getExtraState(): Pick<PersistablePaginationState, 'currentSorting' | 'activeFilters'> {
    return {
      activeFilters: this.filter(),
    };
  }
}
