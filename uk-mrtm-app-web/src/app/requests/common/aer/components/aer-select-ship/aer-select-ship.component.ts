import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { map, take } from 'rxjs';

import { AerPort, AerVoyage } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { GovukSelectOption, LinkDirective, SelectComponent } from '@netz/govuk-components';

import {
  AER_OBJECT_ROUTE_KEY,
  AER_SELECT_SHIP_STEP,
  AER_SUBTASK,
  AER_SUBTASK_LIST_MAP,
} from '@requests/common/aer/aer.consts';
import {
  AER_SELECT_SHIP_SUBMIT_NEXT_STEP,
  AER_SELECT_SHIPS_ITEMS_SELECTOR,
} from '@requests/common/aer/components/aer-select-ship/aer-select-ship.consts';
import { aerSelectShipFormGroupProvider } from '@requests/common/aer/components/aer-select-ship/aer-select-ship.form-provider';
import { AerSelectShipFormGroupModel } from '@requests/common/aer/components/aer-select-ship/aer-select-ship.types';
import { TASK_FORM } from '@requests/common/task-form.token';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { WizardStepComponent } from '@shared/components';
import { SubTaskListMap } from '@shared/types';

@Component({
  selector: 'mrtm-aer-select-ship',
  imports: [WizardStepComponent, SelectComponent, ReactiveFormsModule, LinkDirective, RouterLink],
  standalone: true,
  templateUrl: './aer-select-ship.component.html',
  providers: [aerSelectShipFormGroupProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerSelectShipComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly taskService: TaskService<any> = inject(TaskService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly submitStep: string = inject(AER_SELECT_SHIP_SUBMIT_NEXT_STEP);
  private readonly subtask: string = inject(AER_SUBTASK);
  private readonly routeParamKey = inject(AER_OBJECT_ROUTE_KEY);
  private readonly shipsSelector = inject(AER_SELECT_SHIPS_ITEMS_SELECTOR);

  public readonly form: FormGroup<AerSelectShipFormGroupModel> = inject<FormGroup>(TASK_FORM);
  public readonly wizardMap: SubTaskListMap<AerPort | AerVoyage> = inject(AER_SUBTASK_LIST_MAP);
  public readonly objectId: Signal<string> = toSignal(
    this.activatedRoute.params.pipe(map((param) => param?.[this.routeParamKey])),
  );
  public readonly availableShips: Signal<Array<GovukSelectOption<string>>> = computed(() => {
    const ships = this.store.select(this.shipsSelector(this.objectId()))();

    return ships
      .filter((ship) => ship.status === TaskItemStatus.COMPLETED)
      .map((ship) => ({
        text: `${ship.name} (IMO: ${ship.imoNumber})`,
        value: ship.imoNumber,
      }));
  });

  public onSubmit(): void {
    this.taskService
      .saveSubtask(this.subtask, AER_SELECT_SHIP_STEP, this.activatedRoute, this.form.value)
      .pipe(take(1))
      .subscribe(() => {
        const objectId = this.objectId();

        this.router.navigate(
          objectId ? ['../', this.submitStep] : ['../', this.form.value.uniqueIdentifier, this.submitStep],
          {
            relativeTo: this.activatedRoute,
          },
        );
      });
  }
}
