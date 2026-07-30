import { inject } from '@angular/core';

import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { TaskItemStatus } from '@requests/common';
import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import {
  APPLICATION_DETAILS_ROUTE_PATH,
  APPLICATION_DETAILS_SUBTASK,
} from '@requests/common/site-visit/subtasks/application-details';
import { siteVisitSubtasksMap } from '@requests/common/site-visit/subtasks/site-visit.subtasks-map';
import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';
import { SiteVisitReviewActionButtonsComponent } from '@requests/tasks/site-visit-review/components';
import { SITE_VISIT_REVIEW_ROUTE_PREFIX } from '@requests/tasks/site-visit-review/site-visit-review.constants';
import { taskActionTypeToTitleTransformer } from '@shared/utils';

export const siteVisitReviewTaskContent: RequestTaskPageContentFactory = () => {
  const store = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();
  const year = store.select(siteVisitCommonQuery.selectYear)();

  return {
    header: taskActionTypeToTitleTransformer(requestTaskType, year),
    preContentComponent: SiteVisitReviewActionButtonsComponent,
    sections: [
      {
        title: siteVisitSubtasksMap.applicationDetails.caption,
        tasks: [
          {
            name: APPLICATION_DETAILS_SUBTASK,
            status: store.select(siteVisitReviewQuery.selectReviewDecisionDTO)()?.type ?? TaskItemStatus.UNDECIDED,
            linkText: siteVisitSubtasksMap.applicationDetails.title,
            link: `${SITE_VISIT_REVIEW_ROUTE_PREFIX}/${APPLICATION_DETAILS_ROUTE_PATH}`,
          },
        ],
      },
    ],
  };
};
