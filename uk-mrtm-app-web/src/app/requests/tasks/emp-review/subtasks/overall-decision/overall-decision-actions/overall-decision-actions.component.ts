import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EmpIssuanceDetermination } from '@mrtm/api';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { empReviewQuery, EmpReviewTaskPayload } from '@requests/common';
import {
  OVERALL_DECISION_SUB_TASK,
  overallDecisionMap,
  OverallDecisionWizardStep,
} from '@requests/common/emp/subtasks/overall-decision';
import { EmpReviewService } from '@requests/tasks/emp-review/services';

@Component({
  selector: 'mrtm-overall-decision-actions',
  imports: [PageHeadingComponent, ReturnToTaskOrActionPageComponent, ButtonDirective, PendingButtonDirective],
  standalone: true,
  templateUrl: './overall-decision-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverallDecisionActionsComponent {
  private readonly service: TaskService<EmpReviewTaskPayload> = inject(TaskService<EmpReviewTaskPayload>);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  overallDecisionMap = overallDecisionMap;
  isAcceptedEnabled = this.store.select(empReviewQuery.selectAreAllSectionsAccepted)();

  onSubmit(type: EmpIssuanceDetermination['type']) {
    (this.service as EmpReviewService)
      .saveReviewDetermination(
        OVERALL_DECISION_SUB_TASK,
        OverallDecisionWizardStep.OVERALL_DECISION_ACTIONS,
        this.route,
        type,
      )
      .subscribe();
  }
}
