import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { DateInputComponent, TextareaComponent } from '@netz/govuk-components';

import { empCommonQuery } from '@requests/common/emp/+state';
import { TASK_FORM } from '@requests/common/task-form.token';
import { NotificationTaskPayload } from '@requests/tasks/notification-submit/notification.types';
import {
  DETAILS_CHANGE_SUB_TASK,
  DetailsChangeWizardStep,
} from '@requests/tasks/notification-submit/subtasks/details-change/details-change.helper';
import { nonSignificantChangeFormProvider } from '@requests/tasks/notification-submit/subtasks/details-change/non-significant-change/non-significant-change.form-provider';
import { detailsChangeMap } from '@requests/tasks/notification-submit/subtasks/subtask-list.map';
import { MultipleFileInputComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-non-significant-change',
  imports: [
    ReactiveFormsModule,
    WizardStepComponent,
    TextareaComponent,
    MultipleFileInputComponent,
    DateInputComponent,
  ],
  standalone: true,
  templateUrl: './non-significant-change.component.html',
  providers: [nonSignificantChangeFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonSignificantChangeComponent {
  public formGroup: UntypedFormGroup = inject(TASK_FORM);
  private readonly service: TaskService<NotificationTaskPayload> = inject(TaskService<NotificationTaskPayload>);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  protected readonly detailsChangeMap = detailsChangeMap;
  public readonly downloadUrl = this.store.select(empCommonQuery.selectTasksDownloadUrl)();

  onSubmit() {
    this.service
      .saveSubtask(
        DETAILS_CHANGE_SUB_TASK,
        DetailsChangeWizardStep.NON_SIGNIFICANT_CHANGE,
        this.route,
        this.formGroup.value,
      )
      .subscribe();
  }
}
