import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  DATA_GAPS_METHODOLOGIES_SUB_TASK,
  dataGapsMethodologiesMap,
  DataGapsMethodologiesStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { dataGapsMethodologiesRequiredProvider } from '@requests/tasks/aer-verification-submit/subtasks/data-gaps-methodologies/data-gaps-methodologies-required/data-gaps-methodologies-required.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-data-gaps-methodologies-required',
  imports: [RadioComponent, RadioOptionComponent, ReactiveFormsModule, WizardStepComponent],
  standalone: true,
  templateUrl: './data-gaps-methodologies-required.component.html',
  providers: [dataGapsMethodologiesRequiredProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGapsMethodologiesRequiredComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = dataGapsMethodologiesMap;

  onSubmit() {
    this.service
      .saveSubtask(
        DATA_GAPS_METHODOLOGIES_SUB_TASK,
        DataGapsMethodologiesStep.METHOD_REQUIRED,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
