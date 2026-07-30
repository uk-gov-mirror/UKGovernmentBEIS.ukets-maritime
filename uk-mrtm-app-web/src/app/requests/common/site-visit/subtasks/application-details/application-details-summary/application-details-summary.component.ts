import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import {
  APPLICATION_DETAILS_SUBTASK,
  ApplicationDetailsWizardSteps,
} from '@requests/common/site-visit/subtasks/application-details';
import { siteVisitSubtasksMap } from '@requests/common/site-visit/subtasks/site-visit.subtasks-map';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { SiteVisitSummaryTemplateComponent } from '@shared/components';

@Component({
  selector: 'mrtm-application-details-summary',
  imports: [
    PageHeadingComponent,
    SiteVisitSummaryTemplateComponent,
    ReturnToTaskOrActionPageComponent,
    ButtonDirective,
    PendingButtonDirective,
  ],
  templateUrl: './application-details-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailsSummaryComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly service = inject(TaskService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly map = siteVisitSubtasksMap.applicationDetails;
  readonly wizardStep = ApplicationDetailsWizardSteps;
  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable);
  readonly siteVisitSummary = this.store.select(siteVisitCommonQuery.selectSiteVisitSummary);
  readonly isSubtaskCompleted = computed(() => {
    return (
      this.store.select(siteVisitCommonQuery.selectStatusForSubtask(APPLICATION_DETAILS_SUBTASK))() ===
      TaskItemStatus.COMPLETED
    );
  });

  onSubmit(): void {
    this.service
      .submitSubtask(APPLICATION_DETAILS_SUBTASK, ApplicationDetailsWizardSteps.SUMMARY, this.route)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
