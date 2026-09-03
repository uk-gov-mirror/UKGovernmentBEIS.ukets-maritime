import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { NonComplianceNoticeOfIntentRequestTaskPayload } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { TextareaComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  NON_COMPLIANCE_NOTICE_OF_INTENT_UPLOAD_SUB_TASK,
  nonComplianceNoticeOfIntentMap,
  NonComplianceNoticeOfIntentUploadStep,
} from '@requests/common/non-compliance';
import { nonComplianceNoticeOfIntentUploadFormProvider } from '@requests/tasks/non-compliance-notice-of-intent/subtasks/upload/non-compliance-notice-of-intent-upload-form/non-compliance-notice-of-intent-upload-form.form-provider';
import { FileInputComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-non-compliance-notice-of-intent-upload-form',
  imports: [FileInputComponent, TextareaComponent, ReactiveFormsModule, WizardStepComponent],
  standalone: true,
  templateUrl: './non-compliance-notice-of-intent-upload-form.component.html',
  providers: [nonComplianceNoticeOfIntentUploadFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonComplianceNoticeOfIntentUploadFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<NonComplianceNoticeOfIntentRequestTaskPayload>);
  private readonly store = inject(RequestTaskStore);

  readonly formGroup = inject<FormGroup>(TASK_FORM);
  readonly map = nonComplianceNoticeOfIntentMap;
  readonly getDownloadUrl: Signal<(uuid: string) => string | string[]> = computed(() => (uuid: string) => [
    this.store.select(requestTaskQuery.selectTasksDownloadUrl)(),
    uuid,
  ]);

  onSubmit() {
    this.service
      .saveSubtask(
        NON_COMPLIANCE_NOTICE_OF_INTENT_UPLOAD_SUB_TASK,
        NonComplianceNoticeOfIntentUploadStep.UPLOAD_FORM,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
