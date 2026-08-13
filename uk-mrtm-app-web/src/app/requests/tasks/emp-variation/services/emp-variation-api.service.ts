import { inject, Injectable } from '@angular/core';

import { catchError, map, Observable, throwError } from 'rxjs';

import { EmpVariationSaveApplicationRequestTaskActionPayload, RequestTaskActionProcessDTO } from '@mrtm/api';

import {
  BusinessErrorService,
  catchBadRequest,
  catchNotFoundRequest,
  catchTaskReassignedBadRequest,
  ErrorCodes,
  requestTaskReassignedError,
  taskNotFoundError,
} from '@netz/common/error';
import { TaskApiService } from '@netz/common/forms';
import { PendingRequestService } from '@netz/common/services';
import { requestTaskQuery } from '@netz/common/store';

import { EmpTaskPayload, EmpVariationTaskPayload } from '@requests/common/emp';
import { empSubmitValidationError } from '@requests/tasks/emp-submit/errors';
import { SaveActionTypes } from '@shared/types';

@Injectable()
export class EmpVariationApiService extends TaskApiService<EmpVariationTaskPayload> {
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly businessErrorService = inject(BusinessErrorService);

  private get saveActionTypes(): SaveActionTypes {
    const taskType = this.store.select(requestTaskQuery.selectRequestTaskType)();
    switch (taskType) {
      case 'EMP_VARIATION':
      default:
        return {
          actionType: 'EMP_VARIATION_SAVE_APPLICATION',
          actionPayloadType: 'EMP_VARIATION_SAVE_APPLICATION_PAYLOAD',
        };
    }
  }

  private get submitActionTypes(): SaveActionTypes {
    const taskType = this.store.select(requestTaskQuery.selectRequestTaskType)();

    switch (taskType) {
      case 'EMP_VARIATION':
      default:
        return {
          actionType: 'EMP_VARIATION_SUBMIT_APPLICATION',
          actionPayloadType: 'EMPTY_PAYLOAD',
        };
    }
  }

  public save(payload: EmpVariationTaskPayload): Observable<EmpVariationTaskPayload> {
    return this.service.processRequestTaskAction(this.createSaveAction(payload)).pipe(
      map(() => payload),
      catchError((err) => {
        if (err.code === ErrorCodes.NOTFOUND1001) {
          this.businessErrorService.showErrorForceNavigation(taskNotFoundError);
        }
        return throwError(() => err);
      }),
      this.pendingRequestService.trackRequest(),
    );
  }

  submit(): Observable<void> {
    return this.service.processRequestTaskAction(this.createSubmitAction()).pipe(
      catchNotFoundRequest(ErrorCodes.NOTFOUND1001, () =>
        this.businessErrorService.showErrorForceNavigation(taskNotFoundError),
      ),
      catchTaskReassignedBadRequest(() =>
        this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError()),
      ),
    );
  }

  importThirdPartyData(payload: EmpTaskPayload): Observable<EmpTaskPayload> {
    return this.service.processRequestTaskAction(this.createImportThirdPartyDataAction(payload)).pipe(
      catchNotFoundRequest(ErrorCodes.NOTFOUND1001, () =>
        this.businessErrorService.showErrorForceNavigation(taskNotFoundError),
      ),
      catchTaskReassignedBadRequest(() =>
        this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError()),
      ),
      catchBadRequest(ErrorCodes.FORM1001, () => {
        const taskId = this.store.select(requestTaskQuery.selectRequestTaskId)();
        return this.businessErrorService.showError(empSubmitValidationError(taskId));
      }),
    );
  }

  private createSaveAction(payload: EmpVariationSaveApplicationRequestTaskActionPayload): RequestTaskActionProcessDTO {
    const requestTaskId = this.store.select(requestTaskQuery.selectRequestTaskId)();
    const { actionType, actionPayloadType } = this.saveActionTypes;
    const {
      empVariationDetails,
      empVariationDetailsCompleted,
      empSectionsCompleted,
      emissionsMonitoringPlan,
      updatedSubtasks,
    } = payload;

    return {
      requestTaskId,
      requestTaskActionType: actionType,
      requestTaskActionPayload: {
        empVariationDetails,
        empVariationDetailsCompleted,
        empSectionsCompleted,
        emissionsMonitoringPlan,
        updatedSubtasks: updatedSubtasks ?? [],
        payloadType: actionPayloadType,
      },
    } as RequestTaskActionProcessDTO;
  }

  private createSubmitAction(): RequestTaskActionProcessDTO {
    const requestTaskId = this.store.select(requestTaskQuery.selectRequestTaskId)();
    const { actionType, actionPayloadType } = this.submitActionTypes;

    return {
      requestTaskId,
      requestTaskActionType: actionType,
      requestTaskActionPayload: {
        payloadType: actionPayloadType,
      },
    } as RequestTaskActionProcessDTO;
  }

  private createImportThirdPartyDataAction(payload: EmpVariationTaskPayload): RequestTaskActionProcessDTO {
    const requestTaskId = this.store.select(requestTaskQuery.selectRequestTaskId)();
    const {
      emissionsMonitoringPlan,
      empSectionsCompleted,
      empVariationDetailsCompleted,
      empVariationDetails,
      updatedSubtasks,
    } = payload;
    const { actionType, actionPayloadType } = this.importThirdPartyDataActionTypes;

    return {
      requestTaskId,
      requestTaskActionType: actionType,
      requestTaskActionPayload: {
        payloadType: actionPayloadType,
        emissionsMonitoringPlan,
        empSectionsCompleted,
        empVariationDetailsCompleted,
        empVariationDetails,
        updatedSubtasks: updatedSubtasks ?? [],
      },
    } as RequestTaskActionProcessDTO;
  }

  private get importThirdPartyDataActionTypes(): SaveActionTypes {
    const taskType = this.store.select(requestTaskQuery.selectRequestTaskType)();

    switch (taskType) {
      case 'EMP_VARIATION_APPLICATION_SUBMIT':
      default:
        return {
          actionType: 'EMP_VARIATION_IMPORT_THIRD_PARTY_DATA_APPLICATION',
          actionPayloadType: 'EMP_VARIATION_IMPORT_THIRD_PARTY_DATA_APPLICATION_PAYLOAD',
        };
    }
  }
}
