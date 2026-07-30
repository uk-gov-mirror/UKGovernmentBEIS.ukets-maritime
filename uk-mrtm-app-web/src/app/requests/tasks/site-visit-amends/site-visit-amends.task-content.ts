import { inject } from '@angular/core';

import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { TaskItemStatus } from '@requests/common';
import { regulatorCommentsSubtaskMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import {
  APPLICATION_DETAILS_ROUTE_PATH,
  APPLICATION_DETAILS_SUBTASK,
} from '@requests/common/site-visit/subtasks/application-details';
import { siteVisitSubtasksMap } from '@requests/common/site-visit/subtasks/site-visit.subtasks-map';
import { SITE_VISIT_AMENDS_ROUTE_PREFIX } from '@requests/tasks/site-visit-amends/site-visit-amends.constants';
import {
  REQUESTED_CHANGES_ROUTE_PATH,
  REQUESTED_CHANGES_SUB_TASK,
} from '@requests/tasks/site-visit-amends/subtasks/requested-changes';
import { taskActionTypeToTitleTransformer } from '@shared/utils';

export const siteVisitAmendsTaskContent: RequestTaskPageContentFactory = () => {
  const store = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();
  const year = store.select(siteVisitCommonQuery.selectYear)();
  const canSubmit =
    store.select(siteVisitCommonQuery.allSectionsCompleted)() &&
    store.select(siteVisitCommonQuery.selectStatusForSubtask(REQUESTED_CHANGES_SUB_TASK))() ===
      TaskItemStatus.COMPLETED;

  return {
    header: taskActionTypeToTitleTransformer(requestTaskType, year),
    sections: [
      {
        title: regulatorCommentsSubtaskMap.title,
        tasks: [
          {
            name: '',
            status: store.select(siteVisitCommonQuery.selectStatusForSubtask(REQUESTED_CHANGES_SUB_TASK))(),
            linkText: regulatorCommentsSubtaskMap.requestedChanges.title,
            link: `${SITE_VISIT_AMENDS_ROUTE_PREFIX}/${REQUESTED_CHANGES_ROUTE_PATH}`,
          },
        ],
      },
      {
        title: siteVisitSubtasksMap.applicationDetails.caption,
        tasks: [
          {
            name: APPLICATION_DETAILS_SUBTASK,
            status: store.select(siteVisitCommonQuery.selectStatusForSubtask(APPLICATION_DETAILS_SUBTASK))(),
            linkText: siteVisitSubtasksMap.applicationDetails.title,
            warningHint: 'Changes have been requested for this section.',
            link: `${SITE_VISIT_AMENDS_ROUTE_PREFIX}/${APPLICATION_DETAILS_ROUTE_PATH}`,
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
            link: canSubmit ? `${SITE_VISIT_AMENDS_ROUTE_PREFIX}/submit` : null,
          },
        ],
      },
    ],
  };
};
