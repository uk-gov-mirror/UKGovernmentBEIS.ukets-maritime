import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthStore, selectUserRoleType } from '@netz/common/auth';
import { RequestActionStore } from '@netz/common/store';

import { siteVisitReviewedQuery } from '@requests/timeline/site-visit-reviewed/+state';
import { ReviewDecisionSummaryTemplateComponent, SiteVisitSummaryTemplateComponent } from '@shared/components';

@Component({
  selector: 'mrtm-site-visit-reviewed',
  imports: [ReviewDecisionSummaryTemplateComponent, SiteVisitSummaryTemplateComponent],
  templateUrl: './site-visit-reviewed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteVisitReviewedComponent {
  private readonly store = inject(RequestActionStore);
  private readonly authStore = inject(AuthStore);
  public readonly userRole = this.authStore.select(selectUserRoleType);

  readonly data = this.store.select(siteVisitReviewedQuery.selectSiteVisitReviewSubmittedSummary);
}
