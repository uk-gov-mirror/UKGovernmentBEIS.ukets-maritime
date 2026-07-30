import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import { SiteVisitReportingYearSummaryTemplateComponent } from '@shared/components';

@Component({
  selector: 'mrtm-site-visit-amend-submit-application',
  imports: [
    ReturnToTaskOrActionPageComponent,
    PageHeadingComponent,
    SiteVisitReportingYearSummaryTemplateComponent,
    PendingButtonDirective,
    ButtonDirective,
  ],
  templateUrl: './site-visit-amends-submit-application.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteVisitAmendsSubmitApplicationComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly reportingYear = this.store.select(siteVisitCommonQuery.selectYear);

  protected onSubmit() {
    this.taskService
      .submit()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['success'], { relativeTo: this.activatedRoute, skipLocationChange: true });
      });
  }
}
