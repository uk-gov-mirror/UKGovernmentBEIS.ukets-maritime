import { inject } from '@angular/core';

import { FeedbackBannerComponent } from '@netz/common/components';
import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { empCommonQuery, TaskItemStatus } from '@requests/common';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { OPERATOR_DETAILS_SUB_TASK } from '@requests/common/components/operator-details';
import { empVariationQuery } from '@requests/common/emp/+state';
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
  variationDetailsSubtaskMap,
} from '@requests/common/emp/subtasks/subtask-list.map';
import { VARIATION_DETAILS_SUB_TASK } from '@requests/common/emp/subtasks/variation-details/variation-details.helper';
import { ThirdPartyDataProviderInfoComponent } from '@requests/common/third-party-data-provider';
import { ADDITIONAL_DOCUMENTS_SUB_TASK } from '@requests/common/utils/additional-documents';
import { taskActionTypeToTitleMap } from '@shared/constants';

const routePrefix = 'emp-variation';
const REQUEST_CHANGES_HINT = 'Changes have been requested for this section.';

export const empVariationTaskContent: RequestTaskPageContentFactory = () => {
  const store: RequestTaskStore = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();
  const allowedRequestTaskActions = store.select(requestTaskQuery.selectAllowedRequestTaskActions)();

  return {
    pageTopComponent: FeedbackBannerComponent,
    header: taskActionTypeToTitleMap?.[requestTaskType],
    preContentComponent: allowedRequestTaskActions.includes('EMP_VARIATION_IMPORT_THIRD_PARTY_DATA_APPLICATION')
      ? ThirdPartyDataProviderInfoComponent
      : null,
    sections: [
      {
        title: variationDetailsSubtaskMap.title,
        tasks: [
          {
            name: 'variation-details',
            status: store.select(
              empCommonQuery.selectStatusForSubtask(VARIATION_DETAILS_SUB_TASK, TaskItemStatus.NOT_STARTED),
            )(),
            linkText: variationDetailsSubtaskMap.empVariationDetails.title,
            link: `${routePrefix}/variation-details`,
          },
        ],
      },
      {
        title: 'Account details',
        tasks: [
          {
            name: OPERATOR_DETAILS_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(OPERATOR_DETAILS_SUB_TASK))(),
            linkText: identifyMaritimeOperatorMap.title,
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(OPERATOR_DETAILS_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
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
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(EMISSIONS_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
            link: `${routePrefix}/emissions`,
          },
          {
            name: EMISSION_SOURCES_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(EMISSION_SOURCES_SUB_TASK))(),
            linkText: emissionSourcesMap.title,
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(EMISSION_SOURCES_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
            link: `${routePrefix}/emission-sources`,
          },
          {
            name: GREENHOUSE_GAS_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(GREENHOUSE_GAS_SUB_TASK))(),
            linkText: greenhouseGasMap.title,
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(GREENHOUSE_GAS_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
            link: `${routePrefix}/greenhouse-gas`,
          },
          {
            name: DATA_GAPS_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(DATA_GAPS_SUB_TASK))(),
            linkText: dataGapsMap.title,
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(DATA_GAPS_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
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
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(MANDATE_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
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
            warningHint: store.select(
              empVariationQuery.selectIsChangesRequestedForSection(MANAGEMENT_PROCEDURES_SUB_TASK),
            )()
              ? REQUEST_CHANGES_HINT
              : null,
            link: `${routePrefix}/management-procedures`,
          },
          {
            name: CONTROL_ACTIVITIES_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(CONTROL_ACTIVITIES_SUB_TASK))(),
            linkText: controlActivitiesMap.title,
            warningHint: store.select(
              empVariationQuery.selectIsChangesRequestedForSection(CONTROL_ACTIVITIES_SUB_TASK),
            )()
              ? REQUEST_CHANGES_HINT
              : null,
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
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(ABBREVIATIONS_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
            link: `${routePrefix}/abbreviations`,
          },
          {
            name: ADDITIONAL_DOCUMENTS_SUB_TASK,
            status: store.select(empCommonQuery.selectStatusForSubtask(ADDITIONAL_DOCUMENTS_SUB_TASK))(),
            linkText: additionalDocumentsMap.title,
            warningHint: store.select(
              empVariationQuery.selectIsChangesRequestedForSection(ADDITIONAL_DOCUMENTS_SUB_TASK),
            )()
              ? REQUEST_CHANGES_HINT
              : null,
            link: `${routePrefix}/additional-documents`,
          },
        ],
      },
      {
        title: 'Send application',
        tasks: [
          {
            name: 'sendVariationToRegulator',
            status: !store.select(empVariationQuery.selectIsEmpSectionCompleted)()
              ? TaskItemStatus.CANNOT_START_YET
              : TaskItemStatus.NOT_STARTED,
            linkText: 'Send application to regulator',
            link: store.select(empVariationQuery.selectIsEmpSectionCompleted)()
              ? `${routePrefix}/send-variation`
              : null,
          },
        ],
      },
    ],
  };
};
