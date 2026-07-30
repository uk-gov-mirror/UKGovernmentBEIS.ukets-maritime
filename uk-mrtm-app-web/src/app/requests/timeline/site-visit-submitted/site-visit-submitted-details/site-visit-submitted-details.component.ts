import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { RequestActionStore } from '@netz/common/store';

import { siteVisitSubmittedQuery } from '@requests/timeline/site-visit-submitted/+state';
import { SiteVisitSummaryTemplateComponent } from '@shared/components';

@Component({
  selector: 'mrtm-site-visit-submitted-details',
  imports: [SiteVisitSummaryTemplateComponent],
  templateUrl: './site-visit-submitted-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteVisitSubmittedDetailsComponent {
  private readonly store = inject(RequestActionStore);
  readonly siteVisitSummary = this.store.select(siteVisitSubmittedQuery.selectSiteVisitSummary);
}
