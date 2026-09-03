import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { DateInputComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { WaitForFollowUpService } from '@requests/tasks/notification-wait-for-follow-up/services/wait-for-follow-up.service';
import { waitForFollowUpMap } from '@requests/tasks/notification-wait-for-follow-up/subtask-list.map';
import { editDueDateFormProvider } from '@requests/tasks/notification-wait-for-follow-up/subtasks/edit-due-date/edit-due-date.form-provider';
import { EDIT_DUE_DATE_SUB_TASK } from '@requests/tasks/notification-wait-for-follow-up/subtasks/edit-due-date/edit-due-date.helper';
import { WaitForFollowUpTaskPayload } from '@requests/tasks/notification-wait-for-follow-up/wait-for-follow-up.types';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-edit-due-date',
  imports: [WizardStepComponent, ReturnToTaskOrActionPageComponent, ReactiveFormsModule, DateInputComponent],
  standalone: true,
  templateUrl: './edit-due-date.component.html',
  providers: [editDueDateFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDueDateComponent {
  private readonly service = inject(TaskService<WaitForFollowUpTaskPayload>);
  readonly form: UntypedFormGroup = inject(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  readonly title = waitForFollowUpMap.editDueDate.title;

  onSubmit() {
    (this.service as WaitForFollowUpService)
      .saveWaitForFollowUp(EDIT_DUE_DATE_SUB_TASK, null, this.route, this.form.value['dueDate'])
      .subscribe();
  }
}
