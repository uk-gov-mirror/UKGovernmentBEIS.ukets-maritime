import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import {
  RECOMMENDED_IMPROVEMENTS_SUB_TASK,
  recommendedImprovementsMap,
  RecommendedImprovementsStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { aerVerificationSubmitQuery } from '@requests/tasks/aer-verification-submit/+state/aer-verification-submit.selectors';
import { RecommendedImprovementsListTemplateComponent } from '@shared/components/summaries';

@Component({
  selector: 'mrtm-recommended-improvements-list',
  imports: [
    RouterLink,
    ButtonDirective,
    PendingButtonDirective,
    PageHeadingComponent,
    ReturnToTaskOrActionPageComponent,
    RecommendedImprovementsListTemplateComponent,
  ],
  standalone: true,
  templateUrl: './recommended-improvements-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendedImprovementsListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  private readonly store = inject(RequestTaskStore);
  readonly map = recommendedImprovementsMap;
  readonly wizardStep = RecommendedImprovementsStep;
  private readonly subtask = RECOMMENDED_IMPROVEMENTS_SUB_TASK;

  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable);
  readonly improvements = computed(
    () => this.store.select(aerVerificationSubmitQuery.selectRecommendedImprovements)()?.recommendedImprovements,
  );

  onSubmit() {
    this.service.saveSubtask(this.subtask, RecommendedImprovementsStep.ITEMS_LIST, this.route, null).subscribe();
  }
}
