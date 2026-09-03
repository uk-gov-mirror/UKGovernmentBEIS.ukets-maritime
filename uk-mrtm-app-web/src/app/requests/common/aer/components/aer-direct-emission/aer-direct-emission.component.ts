import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { map, take } from 'rxjs';

import { AerShipEmissions } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { LinkDirective, TextInputComponent } from '@netz/govuk-components';

import {
  AER_DIRECT_EMISSIONS_STEP,
  AER_OBJECT_ROUTE_KEY,
  AER_RELATED_SHIP_SELECTOR,
  AER_SUBTASK,
  AER_SUBTASK_LIST_MAP,
} from '@requests/common/aer/aer.consts';
import { aerDirectEmissionFormProvider } from '@requests/common/aer/components/aer-direct-emission/aer-direct-emission.form-provider';
import { AerDirectEmissionsFormGroupModel } from '@requests/common/aer/components/aer-direct-emission/aer-direct-emission.types';
import { TASK_FORM } from '@requests/common/task-form.token';
import { WizardStepComponent } from '@shared/components';
import { bigNumberUtils, isNil } from '@shared/utils';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'mrtm-aer-direct-emission',
  imports: [WizardStepComponent, TextInputComponent, ReactiveFormsModule, LinkDirective, RouterLink],
  standalone: true,
  templateUrl: './aer-direct-emission.component.html',
  providers: [aerDirectEmissionFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerDirectEmissionComponent {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly service: TaskService<unknown> = inject(TaskService);
  private readonly subtask: string = inject(AER_SUBTASK);
  private readonly routeParamKey = inject(AER_OBJECT_ROUTE_KEY);
  private readonly relatedShipSelector = inject(AER_RELATED_SHIP_SELECTOR);

  public readonly wizardMap = inject(AER_SUBTASK_LIST_MAP);
  public readonly form: FormGroup<AerDirectEmissionsFormGroupModel> = inject(TASK_FORM);
  private readonly objectId: Signal<string> = toSignal(
    this.activatedRoute.params.pipe(map((param) => param?.[this.routeParamKey])),
  );

  public readonly ship: Signal<AerShipEmissions> = computed(() =>
    this.store.select(this.relatedShipSelector(this.objectId()))(),
  );

  public readonly currentFormValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  constructor() {
    effect(() => {
      const { n2o, ch4, co2, total } = this.currentFormValue();

      const newTotal = bigNumberUtils.getSum([n2o, ch4, co2], 7);
      const isValidValue = new BigNumber(newTotal).isFinite();

      this.form.controls.total.setValue(isValidValue ? newTotal : 0, {
        emitEvent: isValidValue && newTotal !== total,
      });
    });
  }

  public onSubmit(): void {
    this.service
      .saveSubtask(this.subtask, AER_DIRECT_EMISSIONS_STEP, this.activatedRoute, this.form.value)
      .pipe(take(1))
      .subscribe();
  }

  protected readonly isNil = isNil;
}
