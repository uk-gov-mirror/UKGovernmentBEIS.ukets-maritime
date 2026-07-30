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
import { SITE_VISIT_ROUTE_PREFIX } from '@requests/tasks/site-visit-submit/site-visit-submit.constants';
import { taskActionTypeToTitleTransformer } from '@shared/utils';

export const siteVisitSubmitTaskContent: RequestTaskPageContentFactory = () => {
  const store = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();
  const year = store.select(siteVisitCommonQuery.selectYear)();
  const canSubmit = store.select(siteVisitCommonQuery.allSectionsCompleted)();

  return {
    header: taskActionTypeToTitleTransformer(requestTaskType, year),
    sections: [
      {
        title: siteVisitSubtasksMap.applicationDetails.caption,
        tasks: [
          {
            name: APPLICATION_DETAILS_SUBTASK,
            status: store.select(siteVisitCommonQuery.selectStatusForSubtask(APPLICATION_DETAILS_SUBTASK))(),
            linkText: siteVisitSubtasksMap.applicationDetails.title,
            link: `${SITE_VISIT_ROUTE_PREFIX}/${APPLICATION_DETAILS_ROUTE_PATH}`,
          },
        ],
      },
      {
        title: siteVisitSubtasksMap.submit.caption,
        tasks: [
          {
            name: 'send-application',
            status: canSubmit ? TaskItemStatus.NOT_STARTED : TaskItemStatus.CANNOT_START_YET,
            linkText: siteVisitSubtasksMap.submit.title,
            link: canSubmit ? `${SITE_VISIT_ROUTE_PREFIX}/submit` : null,
          },
        ],
      },
    ],
  };
};
