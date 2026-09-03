import { inject, Service } from '@angular/core';

import { Observable } from 'rxjs';

import { EmpIssuanceApplicationReviewRequestTaskPayload, TasksService } from '@mrtm/api';

import {
  BusinessErrorService,
  catchNotFoundRequest,
  catchTaskReassignedBadRequest,
  ErrorCodes,
  requestTaskReassignedError,
  taskNotFoundError,
} from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { REGISTRY_INTEGRATION_TASK_NAME } from '@requests/common/emp/registry-integration';

@Service()
export class RegistryIntegrationApiService {
  private readonly taskStore = inject(RequestTaskStore);
  private readonly tasksService = inject(TasksService);
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly businessErrorService = inject(BusinessErrorService);

  submit(): Observable<EmpIssuanceApplicationReviewRequestTaskPayload> {
    const requestTaskId = this.taskStore.select(requestTaskQuery.selectRequestTaskId)();

    return this.tasksService
      .processRequestTaskAction({
        requestTaskId,
        requestTaskActionType: REGISTRY_INTEGRATION_TASK_NAME,
        requestTaskActionPayload: {
          payloadType: 'EMPTY_PAYLOAD',
        },
      })
      .pipe(
        this.pendingRequestService.trackRequest(),
        catchNotFoundRequest(ErrorCodes.NOTFOUND1001, () =>
          this.businessErrorService.showErrorForceNavigation(taskNotFoundError),
        ),
        catchTaskReassignedBadRequest(() =>
          this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError()),
        ),
      );
  }
}
