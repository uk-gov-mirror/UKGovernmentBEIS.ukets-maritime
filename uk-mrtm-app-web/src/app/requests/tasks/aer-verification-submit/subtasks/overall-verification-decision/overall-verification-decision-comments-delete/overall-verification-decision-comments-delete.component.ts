import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { ButtonDirective, LinkDirective } from '@netz/govuk-components';

import {
  OVERALL_VERIFICATION_DECISION_SUB_TASK,
  overallVerificationDecisionMap,
  OverallVerificationDecisionStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';

@Component({
  selector: 'mrtm-overall-verification-decision-comments-delete',
  imports: [RouterLink, ButtonDirective, LinkDirective, PageHeadingComponent, PendingButtonDirective],
  standalone: true,
  templateUrl: './overall-verification-decision-comments-delete.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverallVerificationDecisionCommentsDeleteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = overallVerificationDecisionMap;
  readonly wizardStep = OverallVerificationDecisionStep;
  private readonly subtask = OVERALL_VERIFICATION_DECISION_SUB_TASK;
  readonly reasonIndex = input<string>();

  onSubmit() {
    this.service
      .saveSubtask(this.subtask, OverallVerificationDecisionStep.VERIFIED_WITH_COMMENTS_DELETE, this.route, {
        reasonIndex: this.reasonIndex(),
      })
      .subscribe();
  }
}
