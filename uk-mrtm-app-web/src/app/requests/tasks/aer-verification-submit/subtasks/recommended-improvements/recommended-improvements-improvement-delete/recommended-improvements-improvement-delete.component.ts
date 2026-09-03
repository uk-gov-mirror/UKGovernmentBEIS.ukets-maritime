import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { ButtonDirective, LinkDirective } from '@netz/govuk-components';

import {
  RECOMMENDED_IMPROVEMENTS_SUB_TASK,
  recommendedImprovementsMap,
  RecommendedImprovementsStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';

@Component({
  selector: 'mrtm-recommended-improvements-improvement-delete',
  imports: [RouterLink, ButtonDirective, LinkDirective, PageHeadingComponent, PendingButtonDirective],
  standalone: true,
  templateUrl: './recommended-improvements-improvement-delete.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendedImprovementsImprovementDeleteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = recommendedImprovementsMap;
  readonly wizardStep = RecommendedImprovementsStep;
  private readonly subtask = RECOMMENDED_IMPROVEMENTS_SUB_TASK;
  readonly reference = input<string>();

  onSubmit() {
    this.service
      .saveSubtask(this.subtask, RecommendedImprovementsStep.ITEM_DELETE, this.route, {
        reference: this.reference(),
      })
      .subscribe();
  }
}
