import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { NonComplianceCivilPenaltyRequestTaskPayload } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { DateInputComponent, TextareaComponent, TextInputComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  NON_COMPLIANCE_CIVIL_PENALTY_UPLOAD_SUB_TASK,
  nonComplianceCivilPenaltyMap,
  NonComplianceCivilPenaltyUploadStep,
} from '@requests/common/non-compliance';
import { nonComplianceCivilPenaltyUploadFormProvider } from '@requests/tasks/non-compliance-civil-penalty/subtasks/upload/non-compliance-civil-penalty-upload-form/non-compliance-civil-penalty-upload-form.form-provider';
import { FileInputComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-non-compliance-civil-penalty-upload-form',
  imports: [
    DateInputComponent,
    FileInputComponent,
    TextareaComponent,
    TextInputComponent,
    ReactiveFormsModule,
    WizardStepComponent,
  ],
  standalone: true,
  templateUrl: './non-compliance-civil-penalty-upload-form.component.html',
  providers: [nonComplianceCivilPenaltyUploadFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonComplianceCivilPenaltyUploadFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<NonComplianceCivilPenaltyRequestTaskPayload>);
  private readonly store = inject(RequestTaskStore);

  readonly formGroup = inject<FormGroup>(TASK_FORM);
  readonly map = nonComplianceCivilPenaltyMap;
  readonly getDownloadUrl: Signal<(uuid: string) => string | string[]> = computed(() => (uuid: string) => [
    this.store.select(requestTaskQuery.selectTasksDownloadUrl)(),
    uuid,
  ]);

  onSubmit() {
    this.service
      .saveSubtask(
        NON_COMPLIANCE_CIVIL_PENALTY_UPLOAD_SUB_TASK,
        NonComplianceCivilPenaltyUploadStep.UPLOAD_FORM,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
