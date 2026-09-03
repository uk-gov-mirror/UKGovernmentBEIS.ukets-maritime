import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import {
  UNCORRECTED_NON_CONFORMITIES_SUB_TASK,
  uncorrectedNonConformitiesMap,
  UncorrectedNonConformitiesStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { aerVerificationSubmitQuery } from '@requests/tasks/aer-verification-submit/+state/aer-verification-submit.selectors';
import { UncorrectedNonConformitiesPriorYearListTemplateComponent } from '@shared/components/summaries';

@Component({
  selector: 'mrtm-uncorrected-non-conformities-prior-year-issues-list',
  imports: [
    RouterLink,
    ButtonDirective,
    PendingButtonDirective,
    PageHeadingComponent,
    ReturnToTaskOrActionPageComponent,
    UncorrectedNonConformitiesPriorYearListTemplateComponent,
  ],
  standalone: true,
  templateUrl: './uncorrected-non-conformities-prior-year-issues-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UncorrectedNonConformitiesPriorYearIssuesListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  private readonly store = inject(RequestTaskStore);
  readonly map = uncorrectedNonConformitiesMap;
  readonly wizardStep = UncorrectedNonConformitiesStep;
  private readonly subtask = UNCORRECTED_NON_CONFORMITIES_SUB_TASK;

  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable);
  readonly issues = computed(
    () => this.store.select(aerVerificationSubmitQuery.selectUncorrectedNonConformities)()?.priorYearIssues,
  );

  onSubmit() {
    this.service
      .saveSubtask(this.subtask, UncorrectedNonConformitiesStep.PRIOR_YEAR_ISSUES_LIST, this.route, null)
      .subscribe();
  }
}
