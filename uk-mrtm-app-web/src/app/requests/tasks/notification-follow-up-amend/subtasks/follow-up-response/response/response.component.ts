import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { TextareaComponent } from '@netz/govuk-components';

import { empCommonQuery } from '@requests/common/emp/+state';
import { TASK_FORM } from '@requests/common/task-form.token';
import { followUpAmendQuery } from '@requests/tasks/notification-follow-up-amend/+state';
import { FollowUpAmendTaskPayload } from '@requests/tasks/notification-follow-up-amend/follow-up-amend.types';
import {
  FOLLOW_UP_RESPONSE_SUB_TASK,
  ResponseWizardStep,
} from '@requests/tasks/notification-follow-up-amend/subtasks/follow-up-response/response.helper';
import { followUpResponseFormProvider } from '@requests/tasks/notification-follow-up-amend/subtasks/follow-up-response/response/response.form-provider';
import { followUpAmendMap } from '@requests/tasks/notification-follow-up-amend/subtasks/subtask-list.map';
import { MultipleFileInputComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-response',
  imports: [ReactiveFormsModule, WizardStepComponent, TextareaComponent, MultipleFileInputComponent],
  standalone: true,
  templateUrl: './response.component.html',
  providers: [followUpResponseFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseComponent {
  private readonly route = inject(ActivatedRoute);
  readonly form: UntypedFormGroup = inject(TASK_FORM);
  private readonly requestTaskStore = inject(RequestTaskStore);
  private readonly service = inject(TaskService<FollowUpAmendTaskPayload>);
  followUpResponseMap = followUpAmendMap.followUpResponse;
  downloadUrl = this.requestTaskStore.select(empCommonQuery.selectTasksDownloadUrl)();
  followUpRequest = this.requestTaskStore.select(followUpAmendQuery.selectPayload)().followUpRequest;

  onSubmit() {
    this.service
      .saveSubtask(FOLLOW_UP_RESPONSE_SUB_TASK, ResponseWizardStep.FOLLOW_UP_RESPONSE, this.route, this.form.value)
      .subscribe();
  }
}
