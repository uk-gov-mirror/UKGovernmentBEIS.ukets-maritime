import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { distinctUntilChanged } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import {
  ConditionalContentDirective,
  LinkDirective,
  RadioComponent,
  RadioOptionComponent,
  SelectComponent,
  TextInputComponent,
} from '@netz/govuk-components';

import { REQUEST_TASK_COMMON_SUBTASK_STEPS_QUERY } from '@requests/+state';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import {
  emissionsShipSubtaskMap,
  emissionsSubtaskMap,
} from '@requests/common/components/emissions/emissions-subtask-list.map';
import {
  FUELS_AND_EMISSIONS_FORM_STEP,
  fuelsAndEmissionsFormFlowMap,
} from '@requests/common/components/emissions/fuels-and-emissions-factors-form/fuels-and-emissions-factors-form.helper';
import {
  fuelsAndEmissionFactorsFormProvider,
  getNitrousOxideValidators,
} from '@requests/common/components/emissions/fuels-and-emissions-factors-form/fuels-and-emissions-factors-form.provider';
import { ShipFuelOriginPipe, ShipStepTitleCustomPipe } from '@requests/common/components/emissions/pipes';
import { ReturnToShipsListTableComponent } from '@requests/common/components/emissions/return-to-ships-list-table';
import { TASK_FORM } from '@requests/common/task-form.token';
import { WizardStepComponent } from '@shared/components';
import {
  DENSITY_METHOD_BUNKER_SELECT_ITEMS,
  DENSITY_METHOD_TANK_SELECT_ITEMS,
  FUEL_TYPES_BY_ORIGIN,
} from '@shared/constants';
import { FuelsAndEmissionsFactors } from '@shared/types';
import { isAer, isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-fuels-and-emission-factors-form',
  imports: [
    ShipStepTitleCustomPipe,
    WizardStepComponent,
    RadioComponent,
    RadioOptionComponent,
    ConditionalContentDirective,
    ShipFuelOriginPipe,
    ReactiveFormsModule,
    SelectComponent,
    NgTemplateOutlet,
    TextInputComponent,
    ReturnToShipsListTableComponent,
    LinkDirective,
    RouterLink,
  ],
  standalone: true,
  templateUrl: './fuels-and-emissions-factors-form.component.html',
  providers: [fuelsAndEmissionFactorsFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuelsAndEmissionsFactorsFormComponent implements OnInit {
  private readonly commonSubtaskStepsQuery = inject(REQUEST_TASK_COMMON_SUBTASK_STEPS_QUERY);
  protected readonly formGroup: FormGroup = inject(TASK_FORM);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly taskService = inject(TaskService);
  private readonly store = inject(RequestTaskStore);
  private readonly isChange =
    this.route.snapshot.queryParamMap.get('change') === 'true' && !this.route.snapshot.queryParamMap.has('create');

  readonly map = emissionsShipSubtaskMap;
  readonly fuelTypeOptions = FUEL_TYPES_BY_ORIGIN;
  readonly densityMethodBunkerOptions = DENSITY_METHOD_BUNKER_SELECT_ITEMS;
  readonly densityMethodTankOptions = DENSITY_METHOD_TANK_SELECT_ITEMS;
  readonly formFlowMap = fuelsAndEmissionsFormFlowMap;
  readonly shipId = input<string>();
  readonly factoryId = input<string>();
  readonly shipName = computed(() => {
    return this.store.select(this.commonSubtaskStepsQuery.selectShipName(this.shipId()))();
  });
  nitrousOxideOptions: number[] | null;

  private readonly taskType = this.store.select(requestTaskQuery.selectRequestTaskType);
  readonly isAer = computed(() => isAer(this.taskType()));
  readonly heading = computed(() => {
    if (this.isAer()) {
      return this.isChange
        ? this.map.fuelsAndEmissionsFactorsFormEdit.title
        : this.map.fuelsAndEmissionsFactorsFormAdd.title;
    }
    return this.map.fuelsAndEmissionsFactors.title;
  });
  readonly returnToLabel = computed(() =>
    this.isAer() ? emissionsShipSubtaskMap.fuelsAndEmissionsFactors.title : emissionsSubtaskMap.title,
  );

  get originValue(): FuelsAndEmissionsFactors['origin'] {
    return this.formGroup.get('origin').value;
  }

  get typeValue(): string {
    return this.formGroup.get('type').value;
  }

  get nitrousOxideCtrl() {
    return this.formGroup.get('nitrousOxide') as FormControl;
  }

  get otherNitrousOxideCtrl() {
    return this.formGroup.get('otherNitrousOxide') as FormControl;
  }

  get fuelNameCtrl() {
    return this.formGroup.get('name') as FormControl;
  }

  ngOnInit() {
    this.setNitrousOxideOptions(this.originValue, this.typeValue);
    this.setDisabledFields(this.originValue, this.typeValue);
    this.disableFuelNameControlIfNeeded();

    this.formGroup
      .get('origin')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.formGroup.reset({ origin: value }, { emitEvent: false }));

    this.nitrousOxideCtrl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((nitrousOxideValue) => {
        if (nitrousOxideValue === 'OTHER') {
          this.otherNitrousOxideCtrl.addValidators(getNitrousOxideValidators());
          this.nitrousOxideCtrl.clearValidators();
        } else {
          this.nitrousOxideCtrl.addValidators(getNitrousOxideValidators());
          this.otherNitrousOxideCtrl.clearValidators();
        }
        this.nitrousOxideCtrl.updateValueAndValidity();
        this.otherNitrousOxideCtrl.updateValueAndValidity();
      });

    this.formGroup
      .get('type')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((typeValue) => {
        if (!isNil(typeValue)) {
          const { data } = this.formFlowMap?.[this.originValue]?.[typeValue] ?? {};
          this.setNitrousOxideOptions(this.originValue, typeValue);
          this.setDisabledFields(this.originValue, typeValue);

          this.formGroup.reset(
            {
              type: typeValue,
              origin: this.formGroup.value?.origin,
              name: this.formGroup.value?.name,
              description: this.formGroup.value?.description,
              ...data,
            },
            { emitEvent: false },
          );

          this.disableFuelNameControlIfNeeded();
        }
      });
  }

  private setNitrousOxideOptions(origin: FuelsAndEmissionsFactors['origin'], type: string) {
    const { nitrousOxideOptions } = this.formFlowMap?.[origin]?.[type] ?? {};
    this.nitrousOxideOptions = nitrousOxideOptions?.length ? nitrousOxideOptions : null;
  }

  private setDisabledFields(origin: FuelsAndEmissionsFactors['origin'], type: string): void {
    const { disabledFields } = this.formFlowMap?.[origin]?.[type] ?? [];

    for (const controlKey of Object.keys(this.formGroup.controls)) {
      const control = this.formGroup.get(controlKey);

      if ((disabledFields ?? []).includes(controlKey)) {
        control.disable();
      } else {
        control.enable();
      }
    }

    this.formGroup.updateValueAndValidity();
    this.formGroup.markAllAsTouched();
  }

  private disableFuelNameControlIfNeeded(): void {
    this.typeValue === 'OTHER' ? this.fuelNameCtrl.enable() : this.fuelNameCtrl.disable();
  }

  onSubmit() {
    this.taskService
      .saveSubtask(EMISSIONS_SUB_TASK, FUELS_AND_EMISSIONS_FORM_STEP, this.route, {
        ...this.formGroup.getRawValue(),
        uniqueIdentifier: this.factoryId(),
        shipId: this.shipId(),
      })
      .subscribe();
  }
}
