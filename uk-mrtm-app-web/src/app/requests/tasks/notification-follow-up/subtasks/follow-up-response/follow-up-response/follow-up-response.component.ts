import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { TextareaComponent } from '@netz/govuk-components';

import { empCommonQuery } from '@requests/common/emp/+state';
import { TASK_FORM } from '@requests/common/task-form.token';
import { followUpQuery } from '@requests/tasks/notification-follow-up/+state';
import { FollowUpTaskPayload } from '@requests/tasks/notification-follow-up/follow-up.types';
import {
  FOLLOW_UP_RESPONSE_SUB_TASK,
  FollowUpResponseWizardStep,
} from '@requests/tasks/notification-follow-up/subtasks/follow-up-response/follow-up-response.helper';
import { followUpResponseFormProvider } from '@requests/tasks/notification-follow-up/subtasks/follow-up-response/follow-up-response/follow-up-response.form-provider';
import { respondToFollowUpMap } from '@requests/tasks/notification-follow-up/subtasks/subtask-list.map';
import { MultipleFileInputComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-follow-up-response',
  imports: [ReactiveFormsModule, WizardStepComponent, TextareaComponent, MultipleFileInputComponent],
  standalone: true,
  templateUrl: './follow-up-response.component.html',
  providers: [followUpResponseFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowUpResponseComponent {
  private readonly route = inject(ActivatedRoute);
  readonly form: UntypedFormGroup = inject(TASK_FORM);
  private readonly requestTaskStore = inject(RequestTaskStore);
  private readonly service: TaskService<FollowUpTaskPayload> = inject(TaskService<FollowUpTaskPayload>);
  followUpResponseMap = respondToFollowUpMap.followUpResponse;
  downloadUrl = this.requestTaskStore.select(empCommonQuery.selectTasksDownloadUrl)();
  followUpRequest = this.requestTaskStore.select(followUpQuery.selectPayload)().followUpRequest;

  onSubmit() {
    this.service
      .saveSubtask(
        FOLLOW_UP_RESPONSE_SUB_TASK,
        FollowUpResponseWizardStep.FOLLOW_UP_RESPONSE,
        this.route,
        this.form.value,
      )
      .subscribe();
  }
}
