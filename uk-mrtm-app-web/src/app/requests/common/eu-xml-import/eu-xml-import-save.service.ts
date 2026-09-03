import { inject, Service } from '@angular/core';

import { catchError, map, Observable, throwError } from 'rxjs';

import { RequestTaskActionProcessDTO, TasksService } from '@mrtm/api';

import {
  BusinessErrorService,
  catchBadRequest,
  catchNotFoundRequest,
  catchTaskReassignedBadRequest,
  ErrorCodes,
  requestTaskReassignedError,
  taskNotFoundError,
} from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { TaskItemStatus } from '@requests/common';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { OPERATOR_DETAILS_SUB_TASK } from '@requests/common/components/operator-details';
import { ABBREVIATIONS_SUB_TASK, isAbbreviationsCompleted } from '@requests/common/emp/subtasks/abbreviations';
import {
  CONTROL_ACTIVITIES_SUB_TASK,
  isControlActivitiesCompleted,
} from '@requests/common/emp/subtasks/control-activities';
import { DATA_GAPS_SUB_TASK, isDataGapsCompleted } from '@requests/common/emp/subtasks/data-gaps';
import { EMISSION_SOURCES_SUB_TASK, isEmissionSourcesCompleted } from '@requests/common/emp/subtasks/emission-sources';
import { isShipWizardCompleted } from '@requests/common/emp/subtasks/emissions';
import { GREENHOUSE_GAS_SUB_TASK, isGreenhouseGasCompleted } from '@requests/common/emp/subtasks/greenhouse-gas';
import {
  isManagementProceduresCompleted,
  MANAGEMENT_PROCEDURES_SUB_TASK,
} from '@requests/common/emp/subtasks/management-procedures';
import { isWizardCompleted, MANDATE_SUB_TASK } from '@requests/common/emp/subtasks/mandate';
import { EuXmlImportData } from '@requests/common/eu-xml-import/eu-xml-import.types';

const SUPPORTED_TASK_TYPES = ['EMP_ISSUANCE_APPLICATION_SUBMIT'] as const;
type SupportedTaskType = (typeof SUPPORTED_TASK_TYPES)[number];

@Service()
export class EuXmlImportSaveService {
  private readonly store = inject(RequestTaskStore);
  private readonly tasksService = inject(TasksService);
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly businessErrorService = inject(BusinessErrorService);

  get isSupportedTaskType(): boolean {
    return SUPPORTED_TASK_TYPES.includes(
      this.store.select(requestTaskQuery.selectRequestTaskType)() as SupportedTaskType,
    );
  }

  save(importData: EuXmlImportData): Observable<void> {
    const taskType = this.store.select(requestTaskQuery.selectRequestTaskType)();
    const requestTaskId = this.store.select(requestTaskQuery.selectRequestTaskId)();
    const currentPayload = this.store.state.requestTaskItem.requestTask.payload as Record<string, any>;

    const mergedPlan = {
      emissions: { ships: importData.shipEmissions },
      sources: importData.emissionSources,
      controlActivities: importData.controlActivities,
      abbreviations: importData.abbreviations,
      // Operator details are tied to the requester's account, not the imported EU XML, so the
      // import process must leave whatever is already on the task untouched.
      operatorDetails: currentPayload?.emissionsMonitoringPlan?.operatorDetails,
      managementProcedures: importData.managementProcedures,
      dataGaps: importData.dataGaps,
      greenhouseGas: importData.greenhouseGas,
      mandate: importData.mandate,
    };

    const ships = mergedPlan.emissions.ships ?? [];
    const shipsCompletion = new Map(ships.map((ship) => [ship.uniqueIdentifier, isShipWizardCompleted(ship)]));
    const emissionsCompleted = ships.length > 0 && ships.every((ship) => shipsCompletion.get(ship.uniqueIdentifier));

    const ismShipImoNumbers = new Set(
      ships
        .filter(
          (ship) =>
            ship?.details?.natureOfReportingResponsibility === 'ISM_COMPANY' &&
            shipsCompletion.get(ship.uniqueIdentifier),
        )
        .map((ship) => ship?.details?.imoNumber),
    );
    const extendedMandate = {
      ...mergedPlan.mandate,
      registeredOwners: (mergedPlan.mandate?.registeredOwners ?? []).map((registeredOwner) => ({
        ...registeredOwner,
        needsReview: (registeredOwner.ships ?? []).some((roShip) => !ismShipImoNumbers.has(roShip.imoNumber)),
      })),
    };

    const subtaskCompletion: Record<string, boolean> = {
      [EMISSIONS_SUB_TASK]: emissionsCompleted,
      [EMISSION_SOURCES_SUB_TASK]: isEmissionSourcesCompleted(mergedPlan.sources),
      [CONTROL_ACTIVITIES_SUB_TASK]: isControlActivitiesCompleted(mergedPlan.controlActivities),
      [ABBREVIATIONS_SUB_TASK]: isAbbreviationsCompleted(mergedPlan.abbreviations),
      [MANAGEMENT_PROCEDURES_SUB_TASK]: isManagementProceduresCompleted(mergedPlan.managementProcedures),
      [DATA_GAPS_SUB_TASK]: isDataGapsCompleted(mergedPlan.dataGaps),
      [GREENHOUSE_GAS_SUB_TASK]: isGreenhouseGasCompleted(mergedPlan.greenhouseGas),
      [MANDATE_SUB_TASK]: isWizardCompleted(extendedMandate, ismShipImoNumbers),
    };

    const statusFor = (completed: boolean) => (completed ? TaskItemStatus.COMPLETED : TaskItemStatus.IN_PROGRESS);

    const updatedSectionsCompleted = {
      ...Object.fromEntries(Object.entries(subtaskCompletion).map(([s, completed]) => [s, statusFor(completed)])),
      ...Object.fromEntries(
        ships.map((ship) => [
          `${EMISSIONS_SUB_TASK}-ship-${ship.uniqueIdentifier}`,
          statusFor(shipsCompletion.get(ship.uniqueIdentifier)),
        ]),
      ),
      [OPERATOR_DETAILS_SUB_TASK]: currentPayload?.empSectionsCompleted?.[OPERATOR_DETAILS_SUB_TASK],
    };

    const action = this.buildSaveAction(taskType, requestTaskId, mergedPlan, updatedSectionsCompleted);

    return this.tasksService.processRequestTaskAction(action).pipe(
      map(() => {
        // Update local store state so the task page reflects the import immediately
        this.store.setState({
          ...this.store.state,
          requestTaskItem: {
            ...this.store.state.requestTaskItem,
            requestTask: {
              ...this.store.state.requestTaskItem.requestTask,
              payload: {
                ...currentPayload,
                emissionsMonitoringPlan: mergedPlan,
                empSectionsCompleted: updatedSectionsCompleted,
              } as any,
            },
          },
        });
      }),
      catchNotFoundRequest(ErrorCodes.NOTFOUND1001, () =>
        this.businessErrorService.showErrorForceNavigation(taskNotFoundError),
      ),
      catchTaskReassignedBadRequest(() =>
        this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError()),
      ),
      catchBadRequest(ErrorCodes.FORM1001, (res) => throwError(() => res)),
      catchError((err) => throwError(() => err)),
      this.pendingRequestService.trackRequest(),
    );
  }

  private buildSaveAction(
    taskType: string,
    requestTaskId: number,
    emissionsMonitoringPlan: unknown,
    empSectionsCompleted: Record<string, string>,
  ): RequestTaskActionProcessDTO {
    switch (taskType as SupportedTaskType) {
      case 'EMP_ISSUANCE_APPLICATION_SUBMIT':
      default:
        return {
          requestTaskId,
          requestTaskActionType: 'EMP_ISSUANCE_SAVE_APPLICATION',
          requestTaskActionPayload: {
            payloadType: 'EMP_ISSUANCE_SAVE_APPLICATION_PAYLOAD',
            emissionsMonitoringPlan,
            empSectionsCompleted,
          },
        } as RequestTaskActionProcessDTO;
    }
  }
}
