import { inject } from '@angular/core';

import { TaskSection } from '@netz/common/model';
import { RequestTaskStore } from '@netz/common/store';

import {
  AER_PORTS_SUB_TASK,
  AER_TOTAL_EMISSIONS_SUB_TASK,
  AER_TOTAL_EMISSIONS_SUB_TASK_PATH,
  aerAdditionalDocumentsMap,
  aerEmissionsMap,
  aerPortsMap,
  aerTotalEmissionsMap,
  monitoringPlanChangesMap,
} from '@requests/common/aer';
import { aerCommonQuery } from '@requests/common/aer/+state';
import {
  AER_AGGREGATED_DATA_SUB_TASK,
  AER_AGGREGATED_DATA_SUB_TASK_PATH,
  aerAggregatedDataSubtasksListMap,
} from '@requests/common/aer/subtasks/aer-aggregated-data';
import { AER_VOYAGES_SUB_TASK, aerVoyagesMap } from '@requests/common/aer/subtasks/aer-voyages';
import {
  MONITORING_PLAN_CHANGES_SUB_TASK,
  MONITORING_PLAN_CHANGES_SUB_TASK_PATH,
} from '@requests/common/aer/subtasks/monitoring-plan-changes';
import { AER_REDUCTION_CLAIM_SUB_TASK, reductionClaimMap } from '@requests/common/aer/subtasks/reduction-claim';
import { EMISSIONS_SUB_TASK, EMISSIONS_SUB_TASK_PATH } from '@requests/common/components/emissions/emissions.helpers';
import {
  OPERATOR_DETAILS_SUB_TASK,
  OPERATOR_DETAILS_SUB_TASK_PATH,
  operatorDetailsMap,
} from '@requests/common/components/operator-details';
import { TaskItemStatus } from '@requests/common/task-item-status';
import {
  ADDITIONAL_DOCUMENTS_SUB_TASK,
  ADDITIONAL_DOCUMENTS_SUB_TASK_PATH,
} from '@requests/common/utils/additional-documents';

export const getGuardedSections = (routePrefix: string, subtaskWarnings?: Record<string, string>): TaskSection[] => {
  const store = inject(RequestTaskStore);
  const hasReportingObligation = store.select(aerCommonQuery.selectHasReportingObligation)();
  if (!hasReportingObligation) {
    return [];
  }

  return [
    {
      title: operatorDetailsMap.title,
      tasks: [
        {
          name: OPERATOR_DETAILS_SUB_TASK,
          status: store.select(
            aerCommonQuery.selectStatusForSubtask(OPERATOR_DETAILS_SUB_TASK, TaskItemStatus.NOT_STARTED),
          )(),
          linkText: operatorDetailsMap.title,
          warningHint: subtaskWarnings?.[OPERATOR_DETAILS_SUB_TASK],
          link: `${routePrefix}/${OPERATOR_DETAILS_SUB_TASK_PATH}`,
        },
      ],
    },
    {
      title: 'Emissions overview',
      tasks: [
        {
          name: MONITORING_PLAN_CHANGES_SUB_TASK,
          status: store.select(
            aerCommonQuery.selectStatusForSubtask(MONITORING_PLAN_CHANGES_SUB_TASK, TaskItemStatus.NOT_STARTED),
          )(),
          linkText: monitoringPlanChangesMap.title,
          warningHint: subtaskWarnings?.[MONITORING_PLAN_CHANGES_SUB_TASK],
          link: `${routePrefix}/${MONITORING_PLAN_CHANGES_SUB_TASK_PATH}`,
        },
        {
          name: EMISSIONS_SUB_TASK,
          status: store.select(aerCommonQuery.selectStatusForSubtask(EMISSIONS_SUB_TASK, TaskItemStatus.NOT_STARTED))(),
          linkText: aerEmissionsMap.title,
          warningHint: subtaskWarnings?.[EMISSIONS_SUB_TASK],
          link: `${routePrefix}/${EMISSIONS_SUB_TASK_PATH}`,
        },
        {
          name: AER_VOYAGES_SUB_TASK,
          status: store.select(aerCommonQuery.selectStatusForVoyagesSubtask)(),
          linkText: aerVoyagesMap.caption,
          warningHint: subtaskWarnings?.[AER_VOYAGES_SUB_TASK],
          link:
            store.select(aerCommonQuery.selectStatusForVoyagesSubtask)() !== TaskItemStatus.CANNOT_START_YET
              ? `${routePrefix}/${AER_VOYAGES_SUB_TASK}`
              : undefined,
        },
        {
          name: AER_PORTS_SUB_TASK,
          status: store.select(aerCommonQuery.selectStatusForPortsSubtask)(),
          linkText: aerPortsMap.caption,
          warningHint: subtaskWarnings?.[AER_PORTS_SUB_TASK],
          link:
            store.select(aerCommonQuery.selectStatusForPortsSubtask)() !== TaskItemStatus.CANNOT_START_YET
              ? `${routePrefix}/${AER_PORTS_SUB_TASK}`
              : undefined,
        },
        {
          name: AER_AGGREGATED_DATA_SUB_TASK,
          status: store.select(aerCommonQuery.selectStatusForAggregatedDataSubtask)(),
          linkText: aerAggregatedDataSubtasksListMap.caption,
          warningHint: subtaskWarnings?.[AER_AGGREGATED_DATA_SUB_TASK],
          link:
            store.select(aerCommonQuery.selectStatusForAggregatedDataSubtask)() !== TaskItemStatus.CANNOT_START_YET
              ? `${routePrefix}/${AER_AGGREGATED_DATA_SUB_TASK_PATH}`
              : undefined,
        },
        {
          name: AER_REDUCTION_CLAIM_SUB_TASK,
          status: store.select(aerCommonQuery.selectStatusForReductionClaim)(),
          linkText: reductionClaimMap.title,
          warningHint: subtaskWarnings?.[AER_REDUCTION_CLAIM_SUB_TASK],
          link:
            store.select(aerCommonQuery.selectStatusForReductionClaim)() !== TaskItemStatus.CANNOT_START_YET
              ? `${routePrefix}/${AER_REDUCTION_CLAIM_SUB_TASK}`
              : undefined,
        },
      ],
    },
    {
      title: 'Additional information',
      tasks: [
        {
          name: ADDITIONAL_DOCUMENTS_SUB_TASK,
          status: store.select(
            aerCommonQuery.selectStatusForSubtask(ADDITIONAL_DOCUMENTS_SUB_TASK, TaskItemStatus.NOT_STARTED),
          )(),
          linkText: aerAdditionalDocumentsMap.title,
          warningHint: subtaskWarnings?.[ADDITIONAL_DOCUMENTS_SUB_TASK],
          link: `${routePrefix}/${ADDITIONAL_DOCUMENTS_SUB_TASK_PATH}`,
        },
      ],
    },
    {
      title: 'Total emissions',
      tasks: [
        {
          name: AER_TOTAL_EMISSIONS_SUB_TASK,
          status: store.select(aerCommonQuery.selectStatusForTotalEmissions)(),
          linkText: aerTotalEmissionsMap.title,
          warningHint: subtaskWarnings?.[AER_TOTAL_EMISSIONS_SUB_TASK],
          link:
            store.select(aerCommonQuery.selectStatusForTotalEmissions)() !== TaskItemStatus.CANNOT_START_YET
              ? `${routePrefix}/${AER_TOTAL_EMISSIONS_SUB_TASK_PATH}`
              : undefined,
        },
      ],
    },
  ];
};
