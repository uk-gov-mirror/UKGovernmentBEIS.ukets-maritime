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
import { AER_PORTS_SUB_TASK, AerPortsWizardStep } from '@requests/common/aer/subtasks/aer-ports/aer-ports.helpers';
import { aerPortsMap } from '@requests/common/aer/subtasks/aer-ports/aer-ports-subtask-list.map';
import { FilterByShipAndDateRange, FilterByShipAndDateRangeComponent } from '@requests/common/components';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { PaginationStatePersistableComponent } from '@shared/abstraction';
import { PortCallsListSummaryTemplateComponent } from '@shared/components';
import { PersistablePaginationState } from '@shared/services';
import { AerPortSummaryItemDto } from '@shared/types';
import { isSameDayOrAfter, isSameDayOrBefore } from '@shared/utils/dates.utils';

@Component({
  selector: 'mrtm-aer-ports-list',
  imports: [
    PageHeadingComponent,
    ButtonDirective,
    ReturnToTaskOrActionPageComponent,
    PortCallsListSummaryTemplateComponent,
    LinkDirective,
    RouterLink,
    ReactiveFormsModule,
    PendingButtonDirective,
    FilterByShipAndDateRangeComponent,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './aer-ports-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerPortsListComponent extends PaginationStatePersistableComponent {
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly store = inject(RequestTaskStore);
  private readonly service: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly formGroup = new UntypedFormGroup({});
  private readonly filter = signal<FilterByShipAndDateRange | null>(
    (this.currentPersistableComponentState()?.activeFilters as FilterByShipAndDateRange) ?? null,
  );
  private readonly allPortCalls = this.store.select(aerCommonQuery.selectPortsList);

  readonly randomUUID = signal(crypto.randomUUID());
  readonly editable: Signal<boolean> = this.store.select(requestTaskQuery.selectIsEditable);
  readonly wizardStep = AerPortsWizardStep;
  readonly wizardMap = aerPortsMap;
  readonly shipsWithPortCalls = this.store.select(aerCommonQuery.selectListOfShipsWithPortCalls);

  readonly filteredPortCalls = computed<AerPortSummaryItemDto[]>(() => {
    const filteredByShip = this.filter()?.imoNumber
      ? this.allPortCalls().filter((portCall) => portCall.imoNumber === this.filter()?.imoNumber)
      : this.allPortCalls();

    if (this.filter()?.arrivalDate && this.filter()?.departureDate) {
      // find all the port calls within arrivalDate - departureDate range
      return filteredByShip.filter(
        (portCall) =>
          isSameDayOrAfter(new Date(portCall.arrivalTime), this.filter()?.arrivalDate) &&
          isSameDayOrBefore(new Date(portCall.departureTime), this.filter()?.departureDate),
      );
    }
    return filteredByShip;
  });

  readonly portsListHeader = computed<string>(() =>
    this.filter()?.shipName ? `Port calls of ${this.filter()?.shipName}` : 'Port calls of all ships',
  );

  readonly canContinue = computed<boolean>(() => this.editable() && this.allPortCalls()?.length > 0);

  private readonly noImoReferenceMessage = computed<string>(() => {
    const allShipsImoNumbers = this.store
      .select(aerCommonQuery.selectShips)()
      ?.map((ship) => ship?.details?.imoNumber);

    const isIncomplete = this.allPortCalls().some((port) => !allShipsImoNumbers?.includes(port?.imoNumber));
    return isIncomplete
      ? `Some port calls are not linked to ships in the 'Ships and emission details list' subtask. Check the Port calls list and make any changes needed.`
      : undefined;
  });

  private readonly needsReviewMessage = computed<string>(() => {
    const needsReviewPortCalls = this.allPortCalls().filter(
      (portCall) => portCall.status === TaskItemStatus.NEEDS_REVIEW,
    );

    if (needsReviewPortCalls.length === 0) {
      return undefined;
    }

    return needsReviewPortCalls.find((portCall) => !portCall.canViewDetails)
      ? `Some port calls have ships with incomplete status. Confirm and complete the ship status from the 'Ships and emission details list' subtask, then review the port call again.`
      : `The port calls and emission details have been updated due to changes made to the 'Ships and emission details list' subtask. Review the information for each port call, then select Confirm and continue.`;
  });

  private readonly notCompletedMessage = computed<string>(() => {
    const isIncomplete = this.allPortCalls().some((portCall) => portCall.status === TaskItemStatus.IN_PROGRESS);
    return isIncomplete ? `Enter the missing details for all entries with the status 'Incomplete'` : undefined;
  });

  readonly warningMessages = computed<string[]>(() =>
    [this.noImoReferenceMessage(), this.needsReviewMessage(), this.notCompletedMessage()].filter((message) => message),
  );

  readonly emptyTableText = computed<string>(() =>
    this.allPortCalls()?.length > this.filteredPortCalls()?.length
      ? 'There are no matching results'
      : 'No items to display',
  );

  onDelete(portCalls: Array<AerPortSummaryItemDto>): void {
    if (portCalls.length) {
      this.formGroup.reset();
      this.feedbackBannerStore.reset();

      this.service
        .saveSubtask(AER_PORTS_SUB_TASK, AerPortsWizardStep.DELETE_PORT, this.activatedRoute, portCalls)
        .pipe(take(1))
        .subscribe();
    } else {
      this.formGroup.setErrors({ NONE_SELECTED: 'Select the port calls to delete' });
      this.feedbackBannerStore.setInvalidForm(this.formGroup);
    }
  }

  onFilterChanged(filterValue: FilterByShipAndDateRange): void {
    this.filter.set(filterValue);
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
