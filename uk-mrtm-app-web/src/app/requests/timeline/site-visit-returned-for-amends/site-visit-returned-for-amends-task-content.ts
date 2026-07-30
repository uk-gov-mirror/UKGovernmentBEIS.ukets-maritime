import { inject } from '@angular/core';

import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestActionQuery, RequestActionStore } from '@netz/common/store';

import { timelineCommonQuery } from '@requests/common';
import { SiteVisitReturnedForAmendsComponent } from '@requests/timeline/site-visit-returned-for-amends/site-visit-returned-for-amends.component';
import { taskActionTypeToTitleTransformer } from '@shared/utils';

export const siteVisitReturnedForAmendsTaskContent: RequestTaskPageContentFactory = () => {
  const store = inject(RequestActionStore);
  const actionType = store.select(requestActionQuery.selectActionType)();
  const year = store.select(timelineCommonQuery.selectReportingYear)();
  const submitter = store.select(requestActionQuery.selectSubmitter)();

  return {
    header: `${taskActionTypeToTitleTransformer(actionType, year)} by ${submitter}`,
    component: SiteVisitReturnedForAmendsComponent,
  };
};
