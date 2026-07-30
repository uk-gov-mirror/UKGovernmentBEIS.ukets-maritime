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
import { SiteVisitPeerReviewActionButtonsComponent } from '@requests/tasks/site-visit-peer-review/components';
import { SITE_VISIT_PEER_REVIEW_ROUTE_PREFIX } from '@requests/tasks/site-visit-peer-review/site-visit-peer-review.constants';
import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';
import { taskActionTypeToTitleTransformer } from '@shared/utils';

export const siteVisitPeerReviewTaskContent: RequestTaskPageContentFactory = () => {
  const store = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();
  const year = store.select(siteVisitCommonQuery.selectYear)();

  return {
    header: taskActionTypeToTitleTransformer(requestTaskType, year),
    preContentComponent: SiteVisitPeerReviewActionButtonsComponent,
    sections: [
      {
        title: siteVisitSubtasksMap.applicationDetails.caption,
        tasks: [
          {
            name: APPLICATION_DETAILS_SUBTASK,
            status: store.select(siteVisitReviewQuery.selectReviewDecisionDTO)()?.type ?? TaskItemStatus.UNDECIDED,
            linkText: siteVisitSubtasksMap.applicationDetails.title,
            link: `${SITE_VISIT_PEER_REVIEW_ROUTE_PREFIX}/${APPLICATION_DETAILS_ROUTE_PATH}`,
          },
        ],
      },
    ],
  };
};
