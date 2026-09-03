import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { AerShipAggregatedData } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import {
  ButtonDirective,
  FieldsetDirective,
  LegendDirective,
  LinkDirective,
  SelectComponent,
  TextInputComponent,
} from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AER_SUBTASK_NEW_ENTRY_FLOW } from '@requests/common/aer/aer.consts';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AER_AGGREGATED_DATA_SUB_TASK,
  AerAggregatedDataWizardStep,
} from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data.helpers';
import {
  addFuelConsumptionGroup,
  aerAggregatedDataFuelConsumptionFormProvider,
} from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data-fuel-consumption/aer-aggregated-data-fuel-consumption.form-provider';
import { aerAggregatedDataSubtasksListMap } from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data-subtasks-list.map';
import { TASK_FORM } from '@requests/common/task-form.token';
import { WizardStepComponent } from '@shared/components';
import { AddAnotherDirective } from '@shared/directives';
import { FuelOriginTitlePipe } from '@shared/pipes';
import { SubTaskListMap } from '@shared/types';
import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-aer-aggregated-data-fuel-consumption',
  imports: [
    ButtonDirective,
    WizardStepComponent,
    ReactiveFormsModule,
    RouterLink,
    LinkDirective,
    SelectComponent,
    TextInputComponent,
    FieldsetDirective,
    LegendDirective,
    AddAnotherDirective,
  ],
  standalone: true,
  templateUrl: './aer-aggregated-data-fuel-consumption.component.html',
  styleUrl: './aer-aggregated-data-fuel-consumption.component.scss',
  providers: [aerAggregatedDataFuelConsumptionFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerAggregatedDataFuelConsumptionComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly service: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  public readonly isAddNewAggregatedData = inject(AER_SUBTASK_NEW_ENTRY_FLOW, { optional: true });

  public form: FormGroup = inject(TASK_FORM);
  private readonly fuelOriginTitlePipe: FuelOriginTitlePipe = new FuelOriginTitlePipe();
  public readonly dataId: InputSignal<string> = input<string>();
  public readonly wizardMap: SubTaskListMap<AerShipAggregatedData> = aerAggregatedDataSubtasksListMap;
  public readonly currentFuelConsumptionsValues = toSignal<Array<any>>(this.fuelConsumptionsFormArray.valueChanges, {
    initialValue: this.fuelConsumptionsFormArray.value,
  });
  public readonly ship = computed(() =>
    this.store.select(aerCommonQuery.selectRelatedShipForAggregatedData(this.dataId()))(),
  );

  public readonly availableFuelSelectItems = computed(() =>
    (this.ship()?.fuelsAndEmissionsFactors ?? []).map((fuelOrigin) => {
      return {
        value: fuelOrigin?.uniqueIdentifier,
        text: this.fuelOriginTitlePipe.transform(fuelOrigin),
      };
    }),
  );

  public readonly fuelTypeSelectItems = computed(() => {
    const selectItems = this.availableFuelSelectItems();
    const currentValues = (this.currentFuelConsumptionsValues() ?? []).map((value) => value?.fuelOriginTypeName);

    return currentValues.map((fuel) =>
      selectItems.filter(
        (item) => (!isNil(fuel) && fuel === item.value) || !currentValues.filter(Boolean).includes(item.value),
      ),
    );
  });

  public get fuelConsumptionsFormArray(): FormArray {
    return this.form.get('fuelConsumptions') as FormArray;
  }

  public onRemoveFuelConsumption(index: number): void {
    this.fuelConsumptionsFormArray.removeAt(index);
  }

  public addFuelConsumption(): void {
    this.fuelConsumptionsFormArray.push(addFuelConsumptionGroup());
  }

  public onSubmit(): void {
    this.service
      .saveSubtask(
        AER_AGGREGATED_DATA_SUB_TASK,
        AerAggregatedDataWizardStep.FUEL_CONSUMPTION,
        this.activatedRoute,
        this.form.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
