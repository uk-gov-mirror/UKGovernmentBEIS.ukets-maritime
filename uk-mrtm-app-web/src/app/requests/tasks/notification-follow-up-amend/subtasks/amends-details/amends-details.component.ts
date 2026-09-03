import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { CheckboxComponent, CheckboxesComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { followUpAmendQuery } from '@requests/tasks/notification-follow-up-amend/+state';
import { FollowUpAmendTaskPayload } from '@requests/tasks/notification-follow-up-amend/follow-up-amend.types';
import { amendsDetailsFormProvider } from '@requests/tasks/notification-follow-up-amend/subtasks/amends-details/amends-details.form-provider';
import { AMENDS_DETAILS_SUB_TASK } from '@requests/tasks/notification-follow-up-amend/subtasks/amends-details/amends-details.helper';
import { followUpAmendMap } from '@requests/tasks/notification-follow-up-amend/subtasks/subtask-list.map';
import { FollowUpAmendsDetailsSummaryTemplateComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-amends-details',
  imports: [
    FollowUpAmendsDetailsSummaryTemplateComponent,
    ReturnToTaskOrActionPageComponent,
    CheckboxComponent,
    ReactiveFormsModule,
    CheckboxesComponent,
    WizardStepComponent,
  ],
  standalone: true,
  templateUrl: './amends-details.component.html',
  providers: [amendsDetailsFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmendsDetailsComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly service: TaskService<FollowUpAmendTaskPayload> = inject(TaskService<FollowUpAmendTaskPayload>);
  protected readonly form: UntypedFormGroup = inject(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  followUpReviewDecision = this.store.select(followUpAmendQuery.selectFollowUpReviewDecisionDTO)();
  readonly title = followUpAmendMap.amendsDetails.title;

  onSubmit() {
    this.service.submitSubtask(AMENDS_DETAILS_SUB_TASK, '../', this.route).subscribe();
  }
}
