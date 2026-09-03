import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  FeedbackBannerComponent,
  FeedbackBannerStore,
  PageHeadingComponent,
  ReturnToTaskOrActionPageComponent,
} from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { TaskItemStatus } from '@requests/common';
import { ListOfShipsTableComponent } from '@requests/common/components/emissions';
import { empCommonQuery } from '@requests/common/emp/+state';
import { EmissionsWizardStep } from '@requests/common/emp/subtasks/emissions/emissions.helpers';
import { emissionsSubTasksMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { MultiSelectedItem } from '@shared/components';
import { ShipEmissionTableListItem } from '@shared/types';

@Component({
  selector: 'mrtm-list-of-ships',
  imports: [
    ListOfShipsTableComponent,
    FeedbackBannerComponent,
    PendingButtonDirective,
    ButtonDirective,
    PageHeadingComponent,
    ReturnToTaskOrActionPageComponent,
  ],
  standalone: true,
  templateUrl: './list-of-ships.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListOfShipsComponent {
  private readonly feedbackBannerStore: FeedbackBannerStore = inject(FeedbackBannerStore);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly formGroup: UntypedFormGroup = new UntypedFormGroup({});

  readonly taskMap = emissionsSubTasksMap;
  readonly listOfShips = this.store.select(empCommonQuery.selectListOfShips);
  readonly canContinue = computed(() => this.listOfShips()?.length);

  readonly notCompletedMessage = computed<string>(() => {
    const notCompleted: boolean = this.listOfShips()?.some((ship) => ship.status !== TaskItemStatus.COMPLETED);
    return notCompleted ? 'Enter the missing details for all entries with the status ‘Incomplete’' : undefined;
  });

  onContinue() {
    if (this.notCompletedMessage()) {
      this.formGroup.setErrors({ NOT_COMPLETED: this.notCompletedMessage() });
      this.feedbackBannerStore.setInvalidForm(this.formGroup);
      return;
    }

    this.formGroup.reset();
    this.feedbackBannerStore.reset();

    this.router.navigate(['../'], { relativeTo: this.activatedRoute, queryParams: { submit: true } });
  }

  onAddNew() {
    this.router.navigate(['../ships', crypto.randomUUID()], { relativeTo: this.activatedRoute });
  }

  onUploadFile() {
    this.router.navigate(['../' + EmissionsWizardStep.UPLOAD_SHIPS], { relativeTo: this.activatedRoute });
  }

  onDeleteShips(ships: MultiSelectedItem<ShipEmissionTableListItem>[]) {
    if (ships.length) {
      this.formGroup.reset();
      this.feedbackBannerStore.reset();

      this.router.navigate(['../', EmissionsWizardStep.DELETE_SHIPS], {
        relativeTo: this.activatedRoute,
        state: { ships: ships.map((ship) => ship.uniqueIdentifier) },
        skipLocationChange: true,
        queryParamsHandling: 'merge',
      });
    } else {
      this.formGroup.setErrors({ NONE_SELECTED: 'Select the ships to delete' });
      this.feedbackBannerStore.setInvalidForm(this.formGroup);
    }
  }
}
