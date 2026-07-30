import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  FeedbackBannerComponent,
  PageHeadingComponent,
  ReturnToTaskOrActionPageComponent,
} from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { followUpReviewQuery } from '@requests/tasks/notification-follow-up-review/+state';
import { FollowUpReviewTaskPayload } from '@requests/tasks/notification-follow-up-review/follow-up-review.types';
import {
  REVIEW_DECISION_SUB_TASK,
  ReviewDecisionWizardStep,
} from '@requests/tasks/notification-follow-up-review/subtasks/review-decision';
import { followUpReviewDecisionMap } from '@requests/tasks/notification-follow-up-review/subtasks/subtask-list.map';
import {
  FollowUpResponseRegulatorSummaryTemplateComponent,
  FollowUpReviewDecisionSummaryTemplateComponent,
} from '@shared/components';
import { FollowUpResponseDTO, FollowUpReviewDecisionDTO, SubTaskListMap } from '@shared/types';

interface ViewModel {
  followUpReviewDecisionDTO: FollowUpReviewDecisionDTO;
  followUpResponseDTO: FollowUpResponseDTO;
  isEditable: boolean;
  followUpReviewDecisionMap: SubTaskListMap<{ reviewDecisionQuestion: string }>;
  wizardStep: { [s: string]: string };
}

@Component({
  selector: 'mrtm-review-decision-summary',
  imports: [
    PageHeadingComponent,
    FollowUpResponseRegulatorSummaryTemplateComponent,
    FollowUpReviewDecisionSummaryTemplateComponent,
    ReturnToTaskOrActionPageComponent,
    PendingButtonDirective,
    ButtonDirective,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './review-decision-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewDecisionSummaryComponent {
  private readonly service: TaskService<EmpTaskPayload> = inject(TaskService<FollowUpReviewTaskPayload>);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly vm: Signal<ViewModel> = computed(() => ({
    followUpReviewDecisionDTO: this.store.select(followUpReviewQuery.selectFollowUpReviewDecisionDTO)(),
    followUpResponseDTO: this.store.select(followUpReviewQuery.selectFollowUpResponseDTO)(),
    isEditable: this.store.select(requestTaskQuery.selectIsEditable)(),
    followUpReviewDecisionMap: followUpReviewDecisionMap,
    wizardStep: ReviewDecisionWizardStep,
  }));

  onSubmit() {
    this.service.submitSubtask(REVIEW_DECISION_SUB_TASK, ReviewDecisionWizardStep.SUMMARY, this.route).subscribe();
  }
}
