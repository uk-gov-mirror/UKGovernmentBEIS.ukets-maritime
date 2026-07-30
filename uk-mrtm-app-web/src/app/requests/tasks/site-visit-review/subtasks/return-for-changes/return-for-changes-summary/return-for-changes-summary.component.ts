import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';
import { SiteVisitReviewService } from '@requests/tasks/site-visit-review/services';
import { ReviewReturnForAmendsSubtaskSummaryTemplateComponent } from '@shared/components';

@Component({
  selector: 'mrtm-aer-operator-amends',
  imports: [
    PageHeadingComponent,
    ReviewReturnForAmendsSubtaskSummaryTemplateComponent,
    ButtonDirective,
    PendingButtonDirective,
    ReturnToTaskOrActionPageComponent,
  ],
  standalone: true,
  templateUrl: './return-for-changes-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnForChangesSummaryComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly service = inject(TaskService) as SiteVisitReviewService;
  private readonly router: Router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  public readonly decisionForAmends = this.store.select(siteVisitReviewQuery.selectReviewDecisionDTO);

  public onSubmit() {
    this.service.sendForAmends().subscribe(() => {
      this.router.navigate(['success'], { relativeTo: this.activatedRoute });
    });
  }
}
