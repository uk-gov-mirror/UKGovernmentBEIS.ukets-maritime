import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { NonComplianceInitialPenaltyNoticeRequestTaskPayload } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { TextareaComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_UPLOAD_SUB_TASK,
  nonComplianceInitialPenaltyNoticeMap,
  NonComplianceInitialPenaltyNoticeUploadStep,
} from '@requests/common/non-compliance';
import { nonComplianceInitialPenaltyNoticeUploadFormProvider } from '@requests/tasks/non-compliance-initial-penalty-notice/subtasks/upload/non-compliance-initial-penalty-notice-upload-form/non-compliance-initial-penalty-notice-upload-form.form-provider';
import { FileInputComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-non-compliance-initial-penalty-notice-upload-form',
  imports: [FileInputComponent, TextareaComponent, ReactiveFormsModule, WizardStepComponent],
  standalone: true,
  templateUrl: './non-compliance-initial-penalty-notice-upload-form.component.html',
  providers: [nonComplianceInitialPenaltyNoticeUploadFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonComplianceInitialPenaltyNoticeUploadFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<NonComplianceInitialPenaltyNoticeRequestTaskPayload>);
  private readonly store = inject(RequestTaskStore);

  readonly formGroup = inject<FormGroup>(TASK_FORM);
  readonly map = nonComplianceInitialPenaltyNoticeMap;
  readonly getDownloadUrl: Signal<(uuid: string) => string | string[]> = computed(() => (uuid: string) => [
    this.store.select(requestTaskQuery.selectTasksDownloadUrl)(),
    uuid,
  ]);

  onSubmit() {
    this.service
      .saveSubtask(
        NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_UPLOAD_SUB_TASK,
        NonComplianceInitialPenaltyNoticeUploadStep.UPLOAD_FORM,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
