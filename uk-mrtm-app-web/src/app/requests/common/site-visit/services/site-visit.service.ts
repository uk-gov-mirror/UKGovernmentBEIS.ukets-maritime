import { Injectable } from '@angular/core';

import { TaskService } from '@netz/common/forms';

import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import { SiteVisitCommonTaskPayload } from '@requests/common/site-visit/site-visit-common.types';

@Injectable()
export class SiteVisitService extends TaskService<SiteVisitCommonTaskPayload> {
  get payload(): SiteVisitCommonTaskPayload {
    return this.store.select(siteVisitCommonQuery.selectPayload)();
  }
  set payload(payload: SiteVisitCommonTaskPayload) {
    this.store.setPayload(payload);
  }
}
