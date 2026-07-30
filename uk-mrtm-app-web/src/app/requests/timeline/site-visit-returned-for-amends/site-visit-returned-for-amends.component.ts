import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { RequestActionStore } from '@netz/common/store';

import { siteVisitReturnedForAmendsQuery } from '@requests/timeline/site-visit-returned-for-amends/+state';
import { ReviewReturnForAmendsSubtaskSummaryTemplateComponent } from '@shared/components';

@Component({
  selector: 'mrtm-site-visit-returned-for-amends',
  imports: [ReviewReturnForAmendsSubtaskSummaryTemplateComponent],
  standalone: true,
  templateUrl: './site-visit-returned-for-amends.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteVisitReturnedForAmendsComponent {
  private readonly store: RequestActionStore = inject(RequestActionStore);
  readonly decision = this.store.select(siteVisitReturnedForAmendsQuery.selectAmendsDecisionsDTO);
}
