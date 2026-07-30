import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { TaskItemStatus } from '@requests/common';
import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import {
  APPLICATION_DETAILS_SUBTASK,
  ApplicationDetailsWizardSteps,
} from '@requests/common/site-visit/subtasks/application-details';
import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';
import { ReviewDecisionSummaryTemplateComponent, SiteVisitSummaryTemplateComponent } from '@shared/components';

@Component({
  selector: 'mrtm-application-details-decision-summary',
  imports: [
    PageHeadingComponent,
    SiteVisitSummaryTemplateComponent,
    ReviewDecisionSummaryTemplateComponent,
    ReturnToTaskOrActionPageComponent,
    ButtonDirective,
    PendingButtonDirective,
  ],
  templateUrl: './application-details-decision-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailsDecisionSummaryComponent {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly store = inject(RequestTaskStore);
  private readonly service = inject(TaskService);

  readonly siteVisit = this.store.select(siteVisitCommonQuery.selectSiteVisitSummary);
  readonly isEditable = computed(() => {
    return (
      this.store.select(requestTaskQuery.selectIsEditable)() &&
      this.store.select(requestTaskQuery.selectRequestTaskType)() !== 'SITE_VISIT_APPLICATION_PEER_REVIEW'
    );
  });
  readonly wizardStep = ApplicationDetailsWizardSteps;
  readonly downloadUrl = this.store.select(requestTaskQuery.selectTasksDownloadUrl)();
  readonly reviewDecision = this.store.select(siteVisitReviewQuery.selectReviewDecisionDTO);

  readonly isSubTaskCompleted = computed(() =>
    [
      TaskItemStatus.ACCEPTED,
      TaskItemStatus.REJECTED,
      TaskItemStatus.OPERATOR_AMENDS_NEEDED,
      TaskItemStatus.COMPLETED,
    ].includes(this.store.select(siteVisitCommonQuery.selectStatusForSubtask(APPLICATION_DETAILS_SUBTASK))()),
  );

  public onSubmit(): void {
    this.service
      .submitSubtask(APPLICATION_DETAILS_SUBTASK, ApplicationDetailsWizardSteps.SUMMARY, this.route)
      .subscribe();
  }
}
