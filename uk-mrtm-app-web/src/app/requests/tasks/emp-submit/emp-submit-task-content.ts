import { inject } from '@angular/core';

import { FeedbackBannerComponent } from '@netz/common/components';
import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { empCommonQuery, TaskItemStatus } from '@requests/common';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { OPERATOR_DETAILS_SUB_TASK } from '@requests/common/components/operator-details';
import { ABBREVIATIONS_SUB_TASK } from '@requests/common/emp/subtasks/abbreviations';
import { CONTROL_ACTIVITIES_SUB_TASK } from '@requests/common/emp/subtasks/control-activities';
import { DATA_GAPS_SUB_TASK } from '@requests/common/emp/subtasks/data-gaps';
import { EMISSION_SOURCES_SUB_TASK } from '@requests/common/emp/subtasks/emission-sources';
import { GREENHOUSE_GAS_SUB_TASK } from '@requests/common/emp/subtasks/greenhouse-gas';
import { MANAGEMENT_PROCEDURES_SUB_TASK } from '@requests/common/emp/subtasks/management-procedures';
import { MANDATE_SUB_TASK } from '@requests/common/emp/subtasks/mandate';
import {
  abbreviationsMap,
  additionalDocumentsMap,
  controlActivitiesMap,
  dataGapsMap,
  emissionSourcesMap,
  emissionsSubTasksMap,
  greenhouseGasMap,
  identifyMaritimeOperatorMap,
  managementProceduresMap,
  mandateMap,
} from '@requests/common/emp/subtasks/subtask-list.map';
import { ThirdPartyDataProviderInfoComponent } from '@requests/common/third-party-data-provider/third-party-data-provider-info';
import { ADDITIONAL_DOCUMENTS_SUB_TASK } from '@requests/common/utils/additional-documents';
import { EMP_SUBMIT_ROUTE_PREFIX } from '@requests/tasks/emp-submit/emp-submit.const';
import { taskActionTypeToTitleMap } from '@shared/constants';

const routePrefix = EMP_SUBMIT_ROUTE_PREFIX;

export const empSubmitTaskContent: RequestTaskPageContentFactory = () => {
  const store = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();
  const allowedRequestTaskActions = store.select(requestTaskQuery.selectAllowedRequestTaskActions)();
  const isEmpSectionCompleted = store.select(empCommonQuery.selectIsEmpSectionCompleted)();

  return {
    pageTopComponent: FeedbackBannerComponent,
    header: taskActionTypeToTitleMap?.[requestTaskType],
    preContentComponent: [
      allowedRequestTaskActions.includes('EMP_ISSUANCE_IMPORT_THIRD_PARTY_DATA_APPLICATION')
        ? ThirdPartyDataProviderInfoComponent
        : null,
    ].filter(Boolean),
    sections: [
      {
        title: 'Account details',
        tasks: [
          {
            name: OPERATOR_DETAILS_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(OPERATOR_DETAILS_SUB_TASK))(),
            linkText: identifyMaritimeOperatorMap.title,
            link: `${routePrefix}/operator-details`,
          },
        ],
      },
      {
        title: 'Emissions monitoring',
        tasks: [
          {
            name: EMISSIONS_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(EMISSIONS_SUB_TASK))(),
            linkText: emissionsSubTasksMap.title,
            link: `${routePrefix}/emissions`,
          },
          {
            name: EMISSION_SOURCES_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(EMISSION_SOURCES_SUB_TASK))(),
            linkText: emissionSourcesMap.title,
            link: `${routePrefix}/emission-sources`,
          },
          {
            name: GREENHOUSE_GAS_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(GREENHOUSE_GAS_SUB_TASK))(),
            linkText: greenhouseGasMap.title,
            link: `${routePrefix}/greenhouse-gas`,
          },
          {
            name: DATA_GAPS_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(DATA_GAPS_SUB_TASK))(),
            linkText: dataGapsMap.title,
            link: `${routePrefix}/data-gaps`,
          },
        ],
      },
      {
        title: 'Delegated UK ETS responsibility',
        tasks: [
          {
            name: MANDATE_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(MANDATE_SUB_TASK))(),
            linkText: mandateMap.title,
            link: `${routePrefix}/mandate`,
          },
        ],
      },
      {
        title: 'Management procedures',
        tasks: [
          {
            name: MANAGEMENT_PROCEDURES_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(MANAGEMENT_PROCEDURES_SUB_TASK))(),
            linkText: managementProceduresMap.title,
            link: `${routePrefix}/management-procedures`,
          },
          {
            name: CONTROL_ACTIVITIES_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(CONTROL_ACTIVITIES_SUB_TASK))(),
            linkText: controlActivitiesMap.title,
            link: `${routePrefix}/control-activities`,
          },
        ],
      },
      {
        title: 'Additional information',
        tasks: [
          {
            name: ABBREVIATIONS_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(ABBREVIATIONS_SUB_TASK))(),
            linkText: abbreviationsMap.title,
            link: `${routePrefix}/abbreviations`,
          },
          {
            name: ADDITIONAL_DOCUMENTS_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(ADDITIONAL_DOCUMENTS_SUB_TASK))(),
            linkText: additionalDocumentsMap.title,
            link: `${routePrefix}/additional-documents`,
          },
        ],
      },
      {
        title: 'Send application',
        tasks: [
          {
            name: 'sendApplicationToRegulator',
            status: isEmpSectionCompleted ? TaskItemStatus.NOT_STARTED : TaskItemStatus.CANNOT_START_YET,
            linkText: 'Send application to regulator',
            link: isEmpSectionCompleted ? `${routePrefix}/send-application` : null,
          },
        ],
      },
    ],
  };
};
