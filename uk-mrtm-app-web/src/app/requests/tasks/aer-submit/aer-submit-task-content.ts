import { inject } from '@angular/core';

import { FeedbackBannerComponent } from '@netz/common/components';
import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { TaskItemStatus } from '@requests/common';
import { reportingObligationMap } from '@requests/common/aer';
import { aerCommonQuery } from '@requests/common/aer/+state';
import { AER_ROUTE_PREFIX } from '@requests/common/aer/aer.consts';
import { getGuardedSections } from '@requests/common/aer/subtasks/aer-subtasks.helpers';
import {
  REPORTING_OBLIGATION_SUB_TASK,
  REPORTING_OBLIGATION_SUB_TASK_PATH,
} from '@requests/common/aer/subtasks/reporting-obligation';
import { ThirdPartyDataProviderInfoComponent } from '@requests/common/third-party-data-provider';
import { aerSubmitQuery } from '@requests/tasks/aer-submit/+state';
import { getCanSubmitAer } from '@requests/tasks/aer-submit/aer-submit.helpers';
import { ReturnedForChangesWarningComponent } from '@requests/tasks/aer-submit/components';
import {
  SEND_REPORT_SUB_TASK,
  SEND_REPORT_SUB_TASK_PATH,
} from '@requests/tasks/aer-submit/subtasks/send-report/send-report.helpers';
import { taskActionTypeToTitleTransformer } from '@shared/utils';

export const aerSubmitTaskContent: RequestTaskPageContentFactory = () => {
  const store = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();
  const year = store.select(aerCommonQuery.selectReportingYear)();
  const canSubmitAer = getCanSubmitAer();
  const allowedRequestTaskActions = store.select(requestTaskQuery.selectAllowedRequestTaskActions)();
  const hasReportingObligation = store.select(aerCommonQuery.selectHasReportingObligation)();
  const shouldSubmitToRegulator = store.select(aerSubmitQuery.selectShouldSubmitToRegulator)();

  return {
    pageTopComponent: FeedbackBannerComponent,
    header: taskActionTypeToTitleTransformer(requestTaskType, year),
    preContentComponent: [
      allowedRequestTaskActions.includes('AER_IMPORT_THIRD_PARTY_DATA_APPLICATION') && hasReportingObligation
        ? ThirdPartyDataProviderInfoComponent
        : null,
      ReturnedForChangesWarningComponent,
    ].filter(Boolean),
    sections: [
      {
        title: reportingObligationMap.title,
        tasks: [
          {
            name: REPORTING_OBLIGATION_SUB_TASK,
            status: store.select(
              aerCommonQuery.selectStatusForSubtask(REPORTING_OBLIGATION_SUB_TASK, TaskItemStatus.NOT_STARTED),
            )(),
            linkText: reportingObligationMap.title,
            link: `${AER_ROUTE_PREFIX}/${REPORTING_OBLIGATION_SUB_TASK_PATH}`,
          },
        ],
      },
      ...getGuardedSections(AER_ROUTE_PREFIX),
      {
        title: 'Send report',
        tasks: [
          {
            name: SEND_REPORT_SUB_TASK,
            status: canSubmitAer ? TaskItemStatus.NOT_STARTED : TaskItemStatus.CANNOT_START_YET,
            linkText: 'Send report',
            hint: !shouldSubmitToRegulator
              ? undefined
              : canSubmitAer
                ? 'You must submit your verified report to your regulator by 31 March'
                : 'You will be able to submit the AER to your regulator from 1 January in the next scheme year',
            link: canSubmitAer ? `${AER_ROUTE_PREFIX}/${SEND_REPORT_SUB_TASK_PATH}` : null,
          },
        ],
      },
    ],
  };
};
