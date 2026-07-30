import { inject } from '@angular/core';

import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestActionQuery, RequestActionStore } from '@netz/common/store';

import { timelineCommonQuery } from '@requests/common';
import { SiteVisitReviewedComponent } from '@requests/timeline/site-visit-reviewed/site-visit-reviewed.component';
import { taskActionTypeToTitleTransformer } from '@shared/utils';

export const siteVisitReviewedTaskContent: RequestTaskPageContentFactory = () => {
  const store = inject(RequestActionStore);
  const actionType = store.select(requestActionQuery.selectActionType)();
  const year = store.select(timelineCommonQuery.selectReportingYear)();
  const submitter = store.select(requestActionQuery.selectSubmitter)();

  return {
    header: `${taskActionTypeToTitleTransformer(actionType, year)} by ${submitter}`,
    component: SiteVisitReviewedComponent,
  };
};
