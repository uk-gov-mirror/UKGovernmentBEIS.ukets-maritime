import { inject } from '@angular/core';

import { FeedbackBannerComponent } from '@netz/common/components';
import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { TaskItemStatus } from '@requests/common';
import { reportingObligationMap } from '@requests/common/aer';
import { aerCommonQuery } from '@requests/common/aer/+state';
import { AER_AMEND_ROUTE_PREFIX } from '@requests/common/aer/aer.consts';
import { getGuardedSections } from '@requests/common/aer/subtasks/aer-subtasks.helpers';
import {
  REPORTING_OBLIGATION_SUB_TASK,
  REPORTING_OBLIGATION_SUB_TASK_PATH,
} from '@requests/common/aer/subtasks/reporting-obligation';
import { REQUESTED_CHANGES_SUB_TASK } from '@requests/common/emp/subtasks/requested-changes';
import { regulatorCommentsSubtaskMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { ThirdPartyDataProviderInfoComponent } from '@requests/common/third-party-data-provider';
import { aerAmendQuery } from '@requests/tasks/aer-amend/+state';
import { getCanSubmitAmendAer } from '@requests/tasks/aer-amend/aer-amend.helpers';
import {
  SEND_REPORT_SUB_TASK,
  SEND_REPORT_SUB_TASK_PATH,
} from '@requests/tasks/aer-amend/subtasks/send-report/send-report.helpers';
import { taskActionTypeToTitleTransformer } from '@shared/utils';

export const aerAmendsTaskContent: RequestTaskPageContentFactory = () => {
  const store = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();
  const year = store.select(aerCommonQuery.selectReportingYear)();
  const requestedChangesStatus = store.select(aerAmendQuery.selectStatusForSubtask(REQUESTED_CHANGES_SUB_TASK))();
  const allowedRequestTaskActions = store.select(requestTaskQuery.selectAllowedRequestTaskActions)();
  const hasReportingObligation = store.select(aerCommonQuery.selectHasReportingObligation)();
  const canSubmitAmendAer = getCanSubmitAmendAer();

  const warnings: Record<string, string> | undefined =
    requestedChangesStatus === TaskItemStatus.COMPLETED
      ? (store.select(aerAmendQuery.selectSubtasksNeedAmends)() ?? []).reduce(
          (acc, subtask) => ({
            ...acc,
            [subtask]: 'Changes have been requested for this section.',
          }),
          {},
        )
      : undefined;

  return {
    pageTopComponent: FeedbackBannerComponent,
    header: taskActionTypeToTitleTransformer(requestTaskType, year),
    preContentComponent: [
      allowedRequestTaskActions.includes('AER_IMPORT_THIRD_PARTY_DATA_APPLICATION') && hasReportingObligation
        ? ThirdPartyDataProviderInfoComponent
        : null,
    ],
    sections: [
      {
        title: regulatorCommentsSubtaskMap.title,
        tasks: [
          {
            name: REQUESTED_CHANGES_SUB_TASK,
            status: requestedChangesStatus,
            linkText: regulatorCommentsSubtaskMap.requestedChanges.title,
            link: `${AER_AMEND_ROUTE_PREFIX}/requested-changes`,
          },
        ],
      },
      {
        title: reportingObligationMap.title,
        tasks: [
          {
            name: REPORTING_OBLIGATION_SUB_TASK,
            status: store.select(
              aerCommonQuery.selectStatusForSubtask(REPORTING_OBLIGATION_SUB_TASK, TaskItemStatus.COMPLETED),
            )(),
            linkText: reportingObligationMap.title,
            warningHint: warnings?.[REPORTING_OBLIGATION_SUB_TASK],
            link: `${AER_AMEND_ROUTE_PREFIX}/${REPORTING_OBLIGATION_SUB_TASK_PATH}`,
          },
        ],
      },
      ...getGuardedSections(AER_AMEND_ROUTE_PREFIX, warnings),
      {
        title: 'Send report',
        tasks: [
          {
            name: SEND_REPORT_SUB_TASK,
            status: canSubmitAmendAer ? TaskItemStatus.NOT_STARTED : TaskItemStatus.CANNOT_START_YET,
            linkText: 'Send report',
            link: canSubmitAmendAer ? `${AER_AMEND_ROUTE_PREFIX}/${SEND_REPORT_SUB_TASK_PATH}` : null,
          },
        ],
      },
    ],
  };
};
