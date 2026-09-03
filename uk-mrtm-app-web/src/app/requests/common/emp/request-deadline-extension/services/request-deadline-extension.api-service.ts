import { inject, Service } from '@angular/core';

import { Observable } from 'rxjs';

import { TasksService } from '@mrtm/api';

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

import { requestDeadlineExtensionSubmitTaskMap } from '@requests/common/emp/request-deadline-extension/request-deadline-extension-task.map';

@Service()
export class RequestDeadlineExtensionApiService {
  private readonly taskStore = inject(RequestTaskStore);
  private readonly tasksService = inject(TasksService);
  private readonly businessErrorService: BusinessErrorService = inject(BusinessErrorService);
  private readonly pendingRequestService = inject(PendingRequestService);

  public submit(payload: any): Observable<unknown> {
    const taskType = this.taskStore.select(requestTaskQuery.selectRequestTaskType)();
    const requestTaskId = this.taskStore.select(requestTaskQuery.selectRequestTaskId)();

    const rdeTaskMap = requestDeadlineExtensionSubmitTaskMap[taskType];

    return this.tasksService
      .processRequestTaskAction({
        requestTaskId,
        requestTaskActionType: rdeTaskMap?.requestTaskType,
        requestTaskActionPayload: {
          ...payload,
          payloadType: rdeTaskMap?.requestTaskPayloadType,
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
