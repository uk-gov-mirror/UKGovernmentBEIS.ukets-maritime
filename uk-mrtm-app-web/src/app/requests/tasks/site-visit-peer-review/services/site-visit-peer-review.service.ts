import { Injectable } from '@angular/core';

import { BasePeerReviewService } from '@requests/common/services';
import { SiteVisitPeerReviewPayload } from '@requests/tasks/site-visit-peer-review/site-visit-peer-review.types';
import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';

@Injectable()
export class SiteVisitPeerReviewService extends BasePeerReviewService<SiteVisitPeerReviewPayload> {
  get payload(): SiteVisitPeerReviewPayload {
    return this.store.select(siteVisitReviewQuery.selectPayload)();
  }

  set payload(payload: SiteVisitPeerReviewPayload) {
    this.store.setPayload(payload);
  }
}
