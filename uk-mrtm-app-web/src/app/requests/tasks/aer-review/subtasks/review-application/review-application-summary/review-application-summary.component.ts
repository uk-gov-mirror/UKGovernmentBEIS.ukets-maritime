import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { TaskItemStatus } from '@requests/common';
import {
  AER_REVIEW_GROUP,
  AER_REVIEW_SUBTASK,
  AER_REVIEW_SUBTASK_DETAILS,
  AER_REVIEW_TASK_TITLE,
  AerReviewWizardSteps,
} from '@requests/tasks/aer-review';
import { aerReviewQuery } from '@requests/tasks/aer-review/+state';
import { ReviewDecisionSummaryTemplateComponent } from '@shared/components';

@Component({
  selector: 'mrtm-review-application-summary',
  imports: [
    PageHeadingComponent,
    ReviewDecisionSummaryTemplateComponent,
    ReturnToTaskOrActionPageComponent,
    ButtonDirective,
    PendingButtonDirective,
    NgComponentOutlet,
  ],
  standalone: true,
  templateUrl: './review-application-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewApplicationSummaryComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly decisionGroup = inject(AER_REVIEW_GROUP);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(TaskService);
  private readonly subtask = inject<string>(AER_REVIEW_SUBTASK, { optional: false });

  public readonly summaryDetails = inject(AER_REVIEW_SUBTASK_DETAILS, { optional: true });
  public readonly caption = inject(AER_REVIEW_TASK_TITLE);
  public readonly wizardMap = AerReviewWizardSteps;
  public readonly decision = computed(() =>
    this.store.select(aerReviewQuery.selectSummaryReviewGroupDecision(this.decisionGroup))(),
  );
  public readonly isEditable = computed(() => this.store.select(requestTaskQuery.selectIsEditable)());

  public readonly canSubmit = computed(
    () =>
      this.isEditable() &&
      ![TaskItemStatus.ACCEPTED, TaskItemStatus.OPERATOR_AMENDS_NEEDED].includes(
        this.store.select(aerReviewQuery.selectStatusForSubtask(this.subtask))(),
      ),
  );

  public onSubmit(): void {
    this.service
      .saveSubtask(this.subtask, this.wizardMap.SUMMARY, this.activatedRoute, this.decisionGroup)
      .pipe(take(1))
      .subscribe();
  }
}
