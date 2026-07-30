import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { map, take } from 'rxjs';

import { AerFuelConsumption, AerShipEmissions } from '@mrtm/api';

import { FeedbackBannerComponent, FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective, WarningTextComponent } from '@netz/govuk-components';

import {
  AER_DELETE_DIRECT_EMISSIONS_STEP,
  AER_DELETE_FUEL_CONSUMPTION_STEP,
  AER_DIRECT_EMISSIONS_STEP,
  AER_EMISSIONS_CALCULATIONS_STEP,
  AER_FUEL_CONSUMPTION_STEP,
  AER_OBJECT_ROUTE_KEY,
  AER_RELATED_SHIP_SELECTOR,
  AER_SUBTASK,
  AER_SUBTASK_LIST_MAP,
  AER_SUBTASK_NEW_ENTRY_FLOW,
} from '@requests/common/aer/aer.consts';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { AER_EMISSIONS_CALCULATIONS_SELECTOR } from '@requests/common/aer/components/aer-emissions-calculations/aer-emissions-calculations.types';
import { AER_PORTS_SUB_TASK, AerPortsWizardStep } from '@requests/common/aer/subtasks/aer-ports/aer-ports.helpers';
import {
  FuelConsumptionAndDirectEmissionsSummaryTemplateComponent,
  VoyageOrPortCallEmissionsSummaryTemplateComponent,
} from '@shared/components';
import { AerJourneyTypeEnum, FuelsAndEmissionsFactors } from '@shared/types';
import { isNil } from '@shared/utils';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'mrtm-aer-emissions-calculations',
  imports: [
    PageHeadingComponent,
    ButtonDirective,
    LinkDirective,
    RouterLink,
    VoyageOrPortCallEmissionsSummaryTemplateComponent,
    PendingButtonDirective,
    WarningTextComponent,
    FuelConsumptionAndDirectEmissionsSummaryTemplateComponent,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './aer-emissions-calculations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerEmissionsCalculationsComponent {
  private readonly subtask: string = inject(AER_SUBTASK);
  private readonly routeParamKey = inject(AER_OBJECT_ROUTE_KEY);
  private readonly relatedShipSelector = inject(AER_RELATED_SHIP_SELECTOR);
  private readonly emissionsCalculationsSelector = inject(AER_EMISSIONS_CALCULATIONS_SELECTOR);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly feedbackBannerStore: FeedbackBannerStore = inject(FeedbackBannerStore);
  private readonly form: UntypedFormGroup = new UntypedFormGroup({});
  private readonly service: TaskService<AerSubmitTaskPayload> = inject(TaskService);

  public readonly isAddNewEntryFlow = inject(AER_SUBTASK_NEW_ENTRY_FLOW, { optional: true });
  public readonly editable: Signal<boolean> = this.store.select(requestTaskQuery.selectIsEditable);
  public readonly wizardStep = AerPortsWizardStep;
  public readonly wizardMap = inject(AER_SUBTASK_LIST_MAP);
  public readonly objectId: Signal<string> = toSignal(
    this.activatedRoute.params.pipe(map((param) => param?.[this.routeParamKey])),
  );

  public readonly emissionsCalculationObject = computed(() => {
    const calculations = this.store.select(this.emissionsCalculationsSelector(this.objectId()))();

    if (calculations?.fuelConsumptions?.length <= 0 && isNil(calculations.directEmissions)) {
      delete calculations.totalEmissions;
      delete calculations.surrenderEmissions;
    }

    return calculations;
  });

  public readonly ship: Signal<AerShipEmissions> = computed(() =>
    this.store.select(this.relatedShipSelector(this.objectId()))(),
  );

  public readonly shipEmissionFactors: Signal<Array<FuelsAndEmissionsFactors>> = computed(() => {
    const ship = this.ship();
    const port = this.emissionsCalculationObject();

    return (ship?.fuelsAndEmissionsFactors ?? []).filter((shipFuelConsumption) =>
      (port?.fuelConsumptions ?? [])
        .map((portFuelConsumption) => portFuelConsumption?.fuelOriginTypeName?.uniqueIdentifier)
        .includes(shipFuelConsumption.uniqueIdentifier),
    );
  });

  public onSubmit(): void {
    const currentPort = this.emissionsCalculationObject();
    let isValid = true;
    const errors: ValidationErrors = {};

    if (isNil(currentPort?.totalEmissions?.total) || new BigNumber(currentPort?.totalEmissions?.total).lt(0)) {
      errors['totalEmissions'] =
        this.subtask === AER_PORTS_SUB_TASK
          ? 'The total in port emissions should be greater than or equal to 0'
          : 'The total emissions from voyage should be greater than or equal to 0';
      isValid = false;
    }

    if (
      currentPort?.journeyType !== AerJourneyTypeEnum.International &&
      !isNil(currentPort?.surrenderEmissions) &&
      new BigNumber(currentPort?.surrenderEmissions?.total).lt(0)
    ) {
      errors['surrenderEmissions'] = 'The emissions figure for surrender should be greater than or equal to 0';
      isValid = false;
    }

    if (!isValid) {
      this.form.setErrors(errors);
      this.feedbackBannerStore.setInvalidForm(this.form);
      return;
    }

    this.form.reset();
    this.feedbackBannerStore.reset();

    this.service
      .saveSubtask(this.subtask, AER_EMISSIONS_CALCULATIONS_STEP, this.activatedRoute, {})
      .pipe(take(1))
      .subscribe();
  }

  public onAddDirectEmissions(): void {
    if (!isNil(this.emissionsCalculationObject()?.directEmissions)) {
      this.form.setErrors({ notAllowed: 'You can only add direct emissions once.' });
      this.feedbackBannerStore.setInvalidForm(this.form);
      return;
    }

    this.form.reset();
    this.feedbackBannerStore.reset();
    this.router.navigate(['./', AER_DIRECT_EMISSIONS_STEP], { relativeTo: this.activatedRoute });
  }

  public onAddFuelConsumption(): void {
    this.router.navigate(['./', AER_FUEL_CONSUMPTION_STEP], { relativeTo: this.activatedRoute });
  }

  public onRemoveDirectEmissions(): void {
    this.service
      .saveSubtask(this.subtask, AER_DELETE_DIRECT_EMISSIONS_STEP, this.activatedRoute, this.objectId())
      .pipe(take(1))
      .subscribe(() => {
        this.feedbackBannerStore.setSuccessMessages(['Direct emissions has been removed successfully']);
      });
  }

  public onRemoveFuelConsumption(fuelConsumption: AerFuelConsumption): void {
    this.service
      .saveSubtask(this.subtask, AER_DELETE_FUEL_CONSUMPTION_STEP, this.activatedRoute, {
        objectId: this.objectId(),
        ...fuelConsumption,
      })
      .pipe(take(1))
      .subscribe(() => {
        this.feedbackBannerStore.setSuccessMessages(['Fuel consumption has been removed successfully']);
      });
  }
}
