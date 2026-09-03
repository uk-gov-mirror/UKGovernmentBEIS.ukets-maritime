import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { aerDerogationsFormProvider } from '@requests/common/aer/subtasks/aer-emissions/aer-derogations/aer-derogations.form-provider';
import { AerEmissionsWizardStep } from '@requests/common/aer/subtasks/aer-emissions/aer-emissions.helpers';
import { aerEmissionsShipMap } from '@requests/common/aer/subtasks/aer-subtasks-list.map';
import { emissionsSubtaskMap } from '@requests/common/components/emissions';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { ReturnToShipsListTableComponent } from '@requests/common/components/emissions/return-to-ships-list-table';
import { TASK_FORM } from '@requests/common/task-form.token';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-aer-derogations',
  imports: [
    RadioComponent,
    RadioOptionComponent,
    ReactiveFormsModule,
    WizardStepComponent,
    ReturnToShipsListTableComponent,
  ],
  standalone: true,
  templateUrl: './aer-derogations.component.html',
  providers: [aerDerogationsFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerDerogationsComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService);
  private readonly store = inject(RequestTaskStore);
  protected readonly map = aerEmissionsShipMap;

  readonly returnToLabel = emissionsSubtaskMap.ships.title;
  readonly shipName = this.store.select(aerCommonQuery.selectShipName(this.route.snapshot.params.shipId));

  onSubmit() {
    this.service
      .saveSubtask(EMISSIONS_SUB_TASK, AerEmissionsWizardStep.DEROGATIONS, this.route, this.formGroup.value)
      .pipe(take(1))
      .subscribe();
  }
}
