import { inject } from '@angular/core';

import { FeedbackBannerComponent } from '@netz/common/components';
import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { empVariationQuery, empVariationRegulatorPeerReviewQuery, TaskItemStatus } from '@requests/common';
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
  variationDetailsSubtaskMap,
} from '@requests/common/emp/subtasks/subtask-list.map';
import { VARIATION_DETAILS_SUB_TASK } from '@requests/common/emp/subtasks/variation-details/variation-details.helper';
import { ADDITIONAL_DOCUMENTS_SUB_TASK } from '@requests/common/utils/additional-documents';
import { EmpVariationRegulatorPeerReviewActionButtonsComponent } from '@requests/tasks/emp-variation-regulator-peer-review/components';
import { taskActionTypeToTitleMap } from '@shared/constants';

const routePrefix = 'emp-variation-regulator-peer-review';
const REQUEST_CHANGES_HINT = 'Changes have been requested for this section.';
const DEFAULT_STATUS = TaskItemStatus.COMPLETED;

export const empVariationRegulatorPeerReviewTaskContent: RequestTaskPageContentFactory = () => {
  const store: RequestTaskStore = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();

  return {
    pageTopComponent: FeedbackBannerComponent,
    header: taskActionTypeToTitleMap?.[requestTaskType],
    preContentComponent: EmpVariationRegulatorPeerReviewActionButtonsComponent,
    sections: [
      {
        title: variationDetailsSubtaskMap.title,
        tasks: [
          {
            name: VARIATION_DETAILS_SUB_TASK,
            status: store.select(empVariationRegulatorPeerReviewQuery.selectStatusForEmpVariationDetailsSubtask)(),
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
            status: DEFAULT_STATUS,
            linkText: identifyMaritimeOperatorMap.title,
            link: `${routePrefix}/operator-details`,
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(OPERATOR_DETAILS_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
          },
        ],
      },
      {
        title: 'Emissions monitoring',
        tasks: [
          {
            name: EMISSIONS_SUB_TASK,
            status: DEFAULT_STATUS,
            linkText: emissionsSubTasksMap.title,
            link: `${routePrefix}/emissions`,
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(EMISSIONS_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
          },
          {
            name: EMISSION_SOURCES_SUB_TASK,
            status: DEFAULT_STATUS,
            linkText: emissionSourcesMap.title,
            link: `${routePrefix}/emission-sources`,
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(EMISSION_SOURCES_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
          },
          {
            name: GREENHOUSE_GAS_SUB_TASK,
            status: DEFAULT_STATUS,
            linkText: greenhouseGasMap.title,
            link: `${routePrefix}/greenhouse-gas`,
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(GREENHOUSE_GAS_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
          },
          {
            name: DATA_GAPS_SUB_TASK,
            status: DEFAULT_STATUS,
            linkText: dataGapsMap.title,
            link: `${routePrefix}/data-gaps`,
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(DATA_GAPS_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
          },
        ],
      },
      {
        title: 'Delegated UK ETS responsibility',
        tasks: [
          {
            name: MANDATE_SUB_TASK,
            status: DEFAULT_STATUS,
            linkText: mandateMap.title,
            link: `${routePrefix}/mandate`,
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(MANDATE_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
          },
        ],
      },
      {
        title: 'Management procedures',
        tasks: [
          {
            name: MANAGEMENT_PROCEDURES_SUB_TASK,
            status: DEFAULT_STATUS,
            linkText: managementProceduresMap.title,
            link: `${routePrefix}/management-procedures`,
            warningHint: store.select(
              empVariationQuery.selectIsChangesRequestedForSection(MANAGEMENT_PROCEDURES_SUB_TASK),
            )()
              ? REQUEST_CHANGES_HINT
              : null,
          },
          {
            name: CONTROL_ACTIVITIES_SUB_TASK,
            status: DEFAULT_STATUS,
            linkText: controlActivitiesMap.title,
            link: `${routePrefix}/control-activities`,
            warningHint: store.select(
              empVariationQuery.selectIsChangesRequestedForSection(CONTROL_ACTIVITIES_SUB_TASK),
            )()
              ? REQUEST_CHANGES_HINT
              : null,
          },
        ],
      },
      {
        title: 'Additional information',
        tasks: [
          {
            name: ABBREVIATIONS_SUB_TASK,
            status: DEFAULT_STATUS,
            linkText: abbreviationsMap.title,
            link: `${routePrefix}/abbreviations`,
            warningHint: store.select(empVariationQuery.selectIsChangesRequestedForSection(ABBREVIATIONS_SUB_TASK))()
              ? REQUEST_CHANGES_HINT
              : null,
          },
          {
            name: ADDITIONAL_DOCUMENTS_SUB_TASK,
            status: DEFAULT_STATUS,
            linkText: additionalDocumentsMap.title,
            link: `${routePrefix}/additional-documents`,
            warningHint: store.select(
              empVariationQuery.selectIsChangesRequestedForSection(ADDITIONAL_DOCUMENTS_SUB_TASK),
            )()
              ? REQUEST_CHANGES_HINT
              : null,
          },
        ],
      },
    ],
  };
};
