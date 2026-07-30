import { ChangeDetectionStrategy, Component, effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { RadioComponent, RadioOptionComponent, TextInputComponent } from '@netz/govuk-components';

import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { ShipStepTitleCustomPipe } from '@requests/common/components/emissions/pipes';
import { ReturnToShipsListTableComponent } from '@requests/common/components/emissions/return-to-ships-list-table';
import { empCommonQuery } from '@requests/common/emp/+state';
import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { EmissionsWizardStep } from '@requests/common/emp/subtasks/emissions/emissions.helpers';
import { exemptionConditionsFormProvider } from '@requests/common/emp/subtasks/emissions/exemption-conditions/exemption-conditions.form-provider';
import { emissionShipSubtasksMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { TASK_FORM } from '@requests/common/task-form.token';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-exemption-conditions',
  imports: [
    WizardStepComponent,
    ShipStepTitleCustomPipe,
    ReactiveFormsModule,
    RadioComponent,
    RadioOptionComponent,
    TextInputComponent,
    ReturnToShipsListTableComponent,
  ],
  standalone: true,
  templateUrl: './exemption-conditions.component.html',
  providers: [exemptionConditionsFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExemptionConditionsComponent {
  protected readonly formGroup = inject(TASK_FORM);
  private readonly taskService: TaskService<EmpTaskPayload> = inject(TaskService<EmpTaskPayload>);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(RequestTaskStore);

  taskMap = emissionShipSubtasksMap;
  shipId = this.route.snapshot.params['shipId'];
  private readonly existCtrlValue: Signal<boolean> = toSignal(this.existCtrl.valueChanges, {
    initialValue: this.existCtrl.value,
  });
  readonly shipName = this.store.select(empCommonQuery.selectShipName(this.shipId))();

  constructor() {
    effect(() => {
      if (this.existCtrlValue()) {
        this.minVoyagesCtrl.enable();
      } else {
        this.minVoyagesCtrl.disable();
        this.minVoyagesCtrl.reset();
      }

      this.formGroup.updateValueAndValidity();
    });
  }

  get existCtrl(): AbstractControl {
    return this.formGroup.get('exist');
  }

  get minVoyagesCtrl(): AbstractControl {
    return this.formGroup.get('minVoyages');
  }

  onSubmit() {
    this.taskService
      .saveSubtask(EMISSIONS_SUB_TASK, EmissionsWizardStep.EXEMPTION_CONDITIONS, this.route, this.formGroup.value)
      .subscribe();
  }
}
