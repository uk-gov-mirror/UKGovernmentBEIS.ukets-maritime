import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { DateInputComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { WaitForAmendsService } from '@requests/tasks/notification-wait-for-amends/services';
import { waitForAmendsMap } from '@requests/tasks/notification-wait-for-amends/subtask-list.map';
import { editDueDateFormProvider } from '@requests/tasks/notification-wait-for-amends/subtasks/edit-due-date/edit-due-date.form-provider';
import { EDIT_DUE_DATE_SUB_TASK } from '@requests/tasks/notification-wait-for-amends/subtasks/edit-due-date/edit-due-date.helper';
import { WaitForAmendsTaskPayload } from '@requests/tasks/notification-wait-for-amends/wait-for-amends.types';
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
  private readonly service = inject(TaskService<WaitForAmendsTaskPayload>);
  readonly form: UntypedFormGroup = inject(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  readonly title = waitForAmendsMap.editDueDate.title;

  onSubmit() {
    (this.service as WaitForAmendsService)
      .saveWaitForAmends(EDIT_DUE_DATE_SUB_TASK, null, this.route, this.form.value['dueDate'])
      .subscribe();
  }
}
