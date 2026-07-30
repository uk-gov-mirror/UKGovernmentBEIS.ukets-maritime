import { inject } from '@angular/core';

import { FeedbackBannerComponent } from '@netz/common/components';
import { RequestTaskPageContentFactory } from '@netz/common/request-task';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { OPERATOR_DETAILS_SUB_TASK } from '@requests/common/components/operator-details';
import { empVariationReviewQuery } from '@requests/common/emp/+state';
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
import { VARIATION_DETAILS_SUB_TASK } from '@requests/common/emp/subtasks/variation-details/variation-details.helper';
import { ADDITIONAL_DOCUMENTS_SUB_TASK } from '@requests/common/utils/additional-documents';
import { variationReviewDetailsSubtaskMap } from '@requests/tasks/emp-variation-review/subtasks/variation-details';
import { taskActionTypeToTitleMap } from '@shared/constants';

const routePrefix = 'emp-variation-wait-for-amend';

export const empVariationWaitForAmendTaskContent: RequestTaskPageContentFactory = () => {
  const store: RequestTaskStore = inject(RequestTaskStore);
  const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();

  return {
    pageTopComponent: FeedbackBannerComponent,
    header: taskActionTypeToTitleMap?.[requestTaskType],
    sections: [
      {
        title: variationReviewDetailsSubtaskMap.title,
        tasks: [
          {
            name: VARIATION_DETAILS_SUB_TASK,
            status: store.select(empVariationReviewQuery.selectStatusForEmpVariationReviewDetailsSubtask)(),
            linkText: variationReviewDetailsSubtaskMap.empVariationDetails.title,
            link: `${routePrefix}/variation-details`,
          },
        ],
      },
      {
        title: 'Account details',
        tasks: [
          {
            name: OPERATOR_DETAILS_SUB_TASK,
            status: store.select(empVariationReviewQuery.selectStatusForSubtask(OPERATOR_DETAILS_SUB_TASK))(),
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
            status: store.select(empVariationReviewQuery.selectStatusForSubtask(EMISSIONS_SUB_TASK))(),
            linkText: emissionsSubTasksMap.title,
            link: `${routePrefix}/emissions`,
          },
          {
            name: EMISSION_SOURCES_SUB_TASK,
            status: store.select(empVariationReviewQuery.selectStatusForSubtask(EMISSION_SOURCES_SUB_TASK))(),
            linkText: emissionSourcesMap.title,
            link: `${routePrefix}/emission-sources`,
          },
          {
            name: GREENHOUSE_GAS_SUB_TASK,
            status: store.select(empVariationReviewQuery.selectStatusForSubtask(GREENHOUSE_GAS_SUB_TASK))(),
            linkText: greenhouseGasMap.title,
            link: `${routePrefix}/greenhouse-gas`,
          },
          {
            name: DATA_GAPS_SUB_TASK,
            status: store.select(empVariationReviewQuery.selectStatusForSubtask(DATA_GAPS_SUB_TASK))(),
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
            status: store.select(empVariationReviewQuery.selectStatusForSubtask(MANDATE_SUB_TASK))(),
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
            status: store.select(empVariationReviewQuery.selectStatusForSubtask(MANAGEMENT_PROCEDURES_SUB_TASK))(),
            linkText: managementProceduresMap.title,
            link: `${routePrefix}/management-procedures`,
          },
          {
            name: CONTROL_ACTIVITIES_SUB_TASK,
            status: store.select(empVariationReviewQuery.selectStatusForSubtask(CONTROL_ACTIVITIES_SUB_TASK))(),
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
            status: store.select(empVariationReviewQuery.selectStatusForSubtask(ABBREVIATIONS_SUB_TASK))(),
            linkText: abbreviationsMap.title,
            link: `${routePrefix}/abbreviations`,
          },
          {
            name: ADDITIONAL_DOCUMENTS_SUB_TASK,
            status: store.select(empVariationReviewQuery.selectStatusForSubtask(ADDITIONAL_DOCUMENTS_SUB_TASK))(),
            linkText: additionalDocumentsMap.title,
            link: `${routePrefix}/additional-documents`,
          },
        ],
      },
      {
        title: 'Decision',
        tasks: [
          {
            name: 'overall-decision',
            status: store.select(empVariationReviewQuery.selectStatusForEmpReviewOverallDecision)(),
            linkText: 'Overall decision',
            link: `${routePrefix}/overall-decision`,
          },
        ],
      },
    ],
  };
};
