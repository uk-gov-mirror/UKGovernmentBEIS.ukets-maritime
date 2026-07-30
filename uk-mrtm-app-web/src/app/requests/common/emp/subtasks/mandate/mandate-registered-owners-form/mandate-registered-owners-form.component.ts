import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { LinkDirective, TextInputComponent } from '@netz/govuk-components';

import { empCommonQuery } from '@requests/common/emp/+state';
import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import {
  MANDATE_REGISTERED_OWNER_FORM_MODE,
  MANDATE_SUB_TASK,
  MandateWizardStep,
} from '@requests/common/emp/subtasks/mandate';
import { mandateRegisteredOwnersFormProvider } from '@requests/common/emp/subtasks/mandate/mandate-registered-owners-form/mandate-registered-owners.form-provider';
import { MANDATE_AVAILABLE_SHIPS_COLUMNS } from '@requests/common/emp/subtasks/mandate/mandate-registered-owners-form/mandate-registered-owners-form.constants';
import { MandateShipSelectItem } from '@requests/common/emp/subtasks/mandate/mandate-registered-owners-form/mandate-registered-owners-form.types';
import { mandateMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { TASK_FORM } from '@requests/common/task-form.token';
import { PaginationStatePersistableComponent } from '@shared/abstraction';
import { DatePickerComponent, MultiSelectTableComponent, WizardStepComponent } from '@shared/components';
import { PersistablePaginationState } from '@shared/services';
import { SubTaskListMap } from '@shared/types';

@Component({
  selector: 'mrtm-mandate-registered-owners-form',
  imports: [
    WizardStepComponent,
    ReactiveFormsModule,
    TextInputComponent,
    DatePickerComponent,
    MultiSelectTableComponent,
    LinkDirective,
    RouterLink,
  ],
  standalone: true,
  templateUrl: './mandate-registered-owners-form.component.html',
  providers: [mandateRegisteredOwnersFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MandateRegisteredOwnersFormComponent extends PaginationStatePersistableComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly service: TaskService<EmpTaskPayload> = inject(TaskService);
  private readonly step: MandateWizardStep.REGISTERED_OWNERS_FORM_ADD | MandateWizardStep.REGISTERED_OWNERS_FORM_EDIT =
    inject(MANDATE_REGISTERED_OWNER_FORM_MODE);

  public readonly form = inject(TASK_FORM);
  public readonly wizardMap: SubTaskListMap<unknown> =
    this.step === MandateWizardStep.REGISTERED_OWNERS_FORM_ADD
      ? mandateMap.registeredOwnersAddForm
      : mandateMap.registeredOwnersEditForm;

  public readonly columns = MANDATE_AVAILABLE_SHIPS_COLUMNS;

  public get shipsCtrl(): AbstractControl {
    return this.form.get('ships');
  }

  public readonly registeredOwnerId = input<string>();

  public readonly availableShips: Signal<Array<MandateShipSelectItem>> = computed(() =>
    this.store.select(empCommonQuery.selectMandateRegisteredOwnerAvailableShips(this.registeredOwnerId()))(),
  );
  public readonly pageSize: number = 10;

  public onShipsSelectionChanged() {
    const selectedShips = this.availableShips()
      .filter((ship) => ship.isSelected)
      .map((ship) => ({
        imoNumber: ship.imoNumber,
        name: ship.name,
      }));
    this.shipsCtrl.setValue(selectedShips?.length ? selectedShips : null);
  }

  public onSubmit(): void {
    this.service
      .saveSubtask(MANDATE_SUB_TASK, this.step, this.activatedRoute, {
        ...this.form.value,
        ships: this.availableShips()
          .filter((ship) => ship.isSelected)
          .map((ship) => ({
            imoNumber: ship.imoNumber,
            name: ship.name,
          })),
      })
      .pipe(take(1))
      .subscribe();
  }

  readonly returnToLabel = mandateMap.registeredOwners.title;

  readonly isEdit = this.step === 'edit';

  public getExtraState(): Pick<PersistablePaginationState, 'currentSorting' | 'activeFilters'> {
    return {};
  }
}
