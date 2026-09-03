import { inject, Service } from '@angular/core';

import { Observable, tap } from 'rxjs';
import { produce } from 'immer';

import {
  AccountClosureSaveRequestTaskActionPayload,
  AccountClosureSubmitRequestTaskPayload,
  RequestTaskActionPayload,
  RequestTaskActionProcessDTO,
  TasksService,
} from '@mrtm/api';

import {
  BusinessErrorService,
  catchNotFoundRequest,
  catchTaskReassignedBadRequest,
  ErrorCodes,
  requestTaskReassignedError,
  taskNotFoundError,
} from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';
import { RequestTaskStore } from '@netz/common/store';

@Service()
export class AccountClosureStateService {
  private readonly store = inject(RequestTaskStore);
  private readonly businessErrorService = inject(BusinessErrorService);
  private readonly tasksService = inject(TasksService);
  private readonly pendingRequest = inject(PendingRequestService);

  get payload(): AccountClosureSubmitRequestTaskPayload {
    return this.store.state.requestTaskItem?.requestTask?.payload;
  }

  private setReason(payload: AccountClosureSubmitRequestTaskPayload) {
    const state = this.store.state;
    const newState = produce(state, (draft) => {
      (draft.requestTaskItem.requestTask.payload as AccountClosureSaveRequestTaskActionPayload).accountClosure =
        payload.accountClosure;
    });
    this.store.setState(newState);
  }

  saveAccountClosure(accountClosureTask: AccountClosureSaveRequestTaskActionPayload): Observable<any> {
    const requestTaskItem = this.store.state?.requestTaskItem;

    const reqBody: RequestTaskActionProcessDTO = {
      requestTaskId: requestTaskItem.requestTask.id,
      requestTaskActionType: 'ACCOUNT_CLOSURE_SAVE_APPLICATION',
      requestTaskActionPayload: {
        ...accountClosureTask,
        payloadType: 'ACCOUNT_CLOSURE_SAVE_APPLICATION_PAYLOAD',
      },
    };

    return this.tasksService.processRequestTaskAction(reqBody).pipe(
      this.pendingRequest.trackRequest(),
      catchNotFoundRequest(ErrorCodes.NOTFOUND1001, () =>
        this.businessErrorService.showErrorForceNavigation(taskNotFoundError),
      ),
      catchTaskReassignedBadRequest(() =>
        this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError()),
      ),
      tap(() => {
        this.setReason(accountClosureTask);
      }),
    );
  }

  submitAccountClosure() {
    const requestTaskItem = this.store.state?.requestTaskItem;
    return this.tasksService
      .processRequestTaskAction({
        requestTaskActionType: 'ACCOUNT_CLOSURE_SUBMIT_APPLICATION',
        requestTaskId: requestTaskItem.requestTask.id,
        requestTaskActionPayload: {
          payloadType: 'EMPTY_PAYLOAD',
        } as RequestTaskActionPayload,
      })
      .pipe(
        this.pendingRequest.trackRequest(),
        catchNotFoundRequest(ErrorCodes.NOTFOUND1001, () =>
          this.businessErrorService.showErrorForceNavigation(taskNotFoundError),
        ),
        catchTaskReassignedBadRequest(() =>
          this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError()),
        ),
      );
  }
}
