import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { EmpVariationDetermination } from '@mrtm/api';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { TaskItemStatus } from '@requests/common';
import { empVariationReviewQuery } from '@requests/common/emp/+state';
import { EmpVariationReviewTaskPayload } from '@requests/common/emp/emp.types';
import {
  OVERALL_DECISION_SUB_TASK,
  overallDecisionMap,
  OverallDecisionWizardStep,
} from '@requests/common/emp/subtasks/overall-decision';
import { EmpVariationReviewService } from '@requests/tasks/emp-variation-review/services';

@Component({
  selector: 'mrtm-overall-decision-actions',
  imports: [PageHeadingComponent, ReturnToTaskOrActionPageComponent, ButtonDirective, PendingButtonDirective],
  standalone: true,
  templateUrl: './overall-decision-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverallDecisionActionsComponent {
  private readonly service: TaskService<EmpVariationReviewTaskPayload> = inject(
    TaskService<EmpVariationReviewTaskPayload>,
  );
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  public overallDecisionMap = overallDecisionMap;
  public isAcceptedEnabled = this.store.select(
    empVariationReviewQuery.selectAreAllSectionsWithStatus(TaskItemStatus.ACCEPTED),
  )();
  public isRejectedEnabled =
    this.store.select(empVariationReviewQuery.selectAtLeastOneSectionWithStatus(TaskItemStatus.REJECTED))() &&
    !this.store.select(
      empVariationReviewQuery.selectAtLeastOneSectionWithStatus(TaskItemStatus.OPERATOR_AMENDS_NEEDED),
    )();

  onSubmit(type: EmpVariationDetermination['type']) {
    (this.service as EmpVariationReviewService)
      .saveReviewDetermination(
        OVERALL_DECISION_SUB_TASK,
        OverallDecisionWizardStep.OVERALL_DECISION_ACTIONS,
        this.route,
        type,
      )
      .subscribe();
  }
}
