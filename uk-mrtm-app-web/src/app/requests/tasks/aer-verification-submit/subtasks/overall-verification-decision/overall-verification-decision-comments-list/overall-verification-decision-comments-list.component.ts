import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective } from '@netz/govuk-components';

import {
  OVERALL_VERIFICATION_DECISION_SUB_TASK,
  overallVerificationDecisionMap,
  OverallVerificationDecisionStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { aerVerificationSubmitQuery } from '@requests/tasks/aer-verification-submit/+state/aer-verification-submit.selectors';

@Component({
  selector: 'mrtm-overall-verification-decision-comments-list',
  imports: [
    RouterLink,
    ButtonDirective,
    LinkDirective,
    PendingButtonDirective,
    PageHeadingComponent,
    ReturnToTaskOrActionPageComponent,
  ],
  standalone: true,
  templateUrl: './overall-verification-decision-comments-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverallVerificationDecisionCommentsListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  private readonly store = inject(RequestTaskStore);
  readonly map = overallVerificationDecisionMap;
  readonly wizardStep = OverallVerificationDecisionStep;
  private readonly subtask = OVERALL_VERIFICATION_DECISION_SUB_TASK;

  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable);
  readonly reasons = this.store.select(aerVerificationSubmitQuery.selectOverallVerificationDecisionReasons);

  onSubmit() {
    this.service
      .saveSubtask(this.subtask, OverallVerificationDecisionStep.VERIFIED_WITH_COMMENTS_LIST, this.route, null)
      .subscribe();
  }
}
