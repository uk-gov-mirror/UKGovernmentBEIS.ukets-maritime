import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { GovukSelectOption, LinkDirective, SelectComponent, TextInputComponent } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AER_REDUCTION_CLAIM_SUB_TASK,
  ReductionClaimWizardStep,
} from '@requests/common/aer/subtasks/reduction-claim/reduction-claim.helpers';
import { reductionClaimMap } from '@requests/common/aer/subtasks/reduction-claim/reduction-claim.map';
import { reductionClaimFuelPurchaseFormProvider } from '@requests/common/aer/subtasks/reduction-claim/reduction-claim-fuel-purchase/reduction-claim-fuel-purchase.form-provider';
import { ReductionClaimFuelPurchaseFormModel } from '@requests/common/aer/subtasks/reduction-claim/reduction-claim-fuel-purchase/reduction-claim-fuel-purchase.types';
import { TASK_FORM } from '@requests/common/task-form.token';
import { MultipleFileInputComponent, WizardStepComponent } from '@shared/components';
import { NotProvidedDirective } from '@shared/directives';
import { FuelOriginTitlePipe } from '@shared/pipes';
import { bigNumberUtils, isNil } from '@shared/utils';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'mrtm-reduction-claim-fuel-purchase',
  imports: [
    WizardStepComponent,
    LinkDirective,
    RouterLink,
    TextInputComponent,
    SelectComponent,
    ReactiveFormsModule,
    MultipleFileInputComponent,
    NotProvidedDirective,
    FuelOriginTitlePipe,
  ],
  standalone: true,
  templateUrl: './reduction-claim-fuel-purchase.component.html',
  providers: [reductionClaimFuelPurchaseFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReductionClaimFuelPurchaseComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly service: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly route = inject(ActivatedRoute);
  public readonly form: FormGroup = inject(TASK_FORM);

  private readonly fuelOriginTitlePipe: FuelOriginTitlePipe = new FuelOriginTitlePipe();

  private readonly currentFormValue = toSignal<ReductionClaimFuelPurchaseFormModel>(this.form.valueChanges, {
    initialValue: this.form.value,
  });
  public readonly wizardMap = reductionClaimMap;
  public readonly isNil: typeof isNil = isNil;
  public readonly downloadUrl: Signal<string> = this.store.select(requestTaskQuery.selectTasksDownloadUrl);
  public readonly currentFuelPurchase = computed(() => {
    const fuelPurchaseId = this.route.snapshot.paramMap.get('fuelPurchaseId');
    if (fuelPurchaseId) {
      return this.store.select(aerCommonQuery.selectReductionClaimFuelPurchase(fuelPurchaseId))();
    }
    return null;
  });
  private readonly isChange = !isNil(this.route.snapshot.paramMap.get('fuelPurchaseId'));

  protected readonly heading = computed(() => {
    return this.isChange ? this.wizardMap.purchaseEdit : this.wizardMap.purchaseAdd;
  });

  public readonly fuelTypeSelectItems = computed(() =>
    this.store
      .select(aerCommonQuery.selectSupersetOfFuelTypes)()
      .map<GovukSelectOption>((shipFuel) => ({
        value: shipFuel.uniqueIdentifier,
        text: this.fuelOriginTitlePipe.transform(shipFuel),
      }))
      .reduce((acc, current) => {
        if (!acc.find((entry) => entry.text === current.text)) {
          acc.push(current);
        }

        return acc;
      }, []),
  );

  constructor() {
    effect(() => {
      const { smfMass, co2EmissionFactor } = this.currentFormValue();
      if (
        isNil(smfMass) ||
        isNil(co2EmissionFactor) ||
        typeof +smfMass !== 'number' ||
        typeof +co2EmissionFactor !== 'number' ||
        new BigNumber(smfMass).isNaN() ||
        new BigNumber(co2EmissionFactor).isNaN()
      ) {
        this.form.get('co2Emissions').setValue(null, { emitEvent: false });
        return;
      }

      this.form
        .get('co2Emissions')
        .setValue(
          bigNumberUtils.getFixed(new BigNumber(smfMass).multipliedBy(new BigNumber(co2EmissionFactor)).toString(), 7),
          { emitEvent: false },
        );
    });
  }

  public onSubmit(): void {
    this.service
      .saveSubtask(
        AER_REDUCTION_CLAIM_SUB_TASK,
        ReductionClaimWizardStep.FUEL_PURCHASE,
        this.activatedRoute,
        this.form.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
