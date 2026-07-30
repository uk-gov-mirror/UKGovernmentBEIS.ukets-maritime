import { inject, Injectable } from '@angular/core';

import { catchError, map, Observable, throwError } from 'rxjs';

import { RequestTaskActionProcessDTO } from '@mrtm/api';

import {
  BusinessErrorService,
  catchNotFoundRequest,
  catchTaskReassignedBadRequest,
  ErrorCodes,
  requestTaskReassignedError,
  taskNotFoundError,
} from '@netz/common/error';
import { TaskApiService } from '@netz/common/forms';
import { PendingRequestService } from '@netz/common/services';
import { requestTaskQuery } from '@netz/common/store';

import { SiteVisitCommonTaskPayload } from '@requests/common/site-visit/site-visit-common.types';
import { SaveActionTypes } from '@shared/types';

@Injectable()
export class SiteVisitApiService extends TaskApiService<SiteVisitCommonTaskPayload> {
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly businessErrorService = inject(BusinessErrorService);

  private get saveActionTypes() {
    return {
      actionType: 'SITE_VISIT_SAVE_APPLICATION',
      actionPayloadType: 'SITE_VISIT_SAVE_APPLICATION_PAYLOAD',
    };
  }

  private get submitActionTypes(): SaveActionTypes {
    return {
      actionType: 'SITE_VISIT_SUBMIT_APPLICATION',
      actionPayloadType: 'EMPTY_PAYLOAD',
    };
  }

  save(payload: SiteVisitCommonTaskPayload): Observable<SiteVisitCommonTaskPayload> {
    return this.service.processRequestTaskAction(this.createSaveAction(payload)).pipe(
      catchError((err) => {
        if (err.code === ErrorCodes.NOTFOUND1001) {
          this.businessErrorService.showErrorForceNavigation(taskNotFoundError);
        }
        return throwError(() => err);
      }),
      this.pendingRequestService.trackRequest(),
      map((response) => response as SiteVisitCommonTaskPayload),
    );
  }

  submit(): Observable<void> {
    return this.handleSubmit(this.createSubmitAction());
  }

  private createSaveAction(payload: SiteVisitCommonTaskPayload): RequestTaskActionProcessDTO {
    const requestTaskId = this.store.select(requestTaskQuery.selectRequestTaskId)();
    const { sectionsCompleted, siteVisit } = payload;
    const { actionType, actionPayloadType } = this.saveActionTypes;

    return {
      requestTaskId,
      requestTaskActionType: actionType,
      requestTaskActionPayload: {
        payloadType: actionPayloadType,
        sectionsCompleted,
        siteVisit,
      },
    } as RequestTaskActionProcessDTO;
  }

  protected handleSubmit(submitAction: RequestTaskActionProcessDTO): Observable<void> {
    return this.service.processRequestTaskAction(submitAction).pipe(
      catchNotFoundRequest(ErrorCodes.NOTFOUND1001, () =>
        this.businessErrorService.showErrorForceNavigation(taskNotFoundError),
      ),
      catchTaskReassignedBadRequest(() =>
        this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError()),
      ),
    );
  }

  private createSubmitAction(): RequestTaskActionProcessDTO {
    const requestTaskId = this.store.select(requestTaskQuery.selectRequestTaskId)();
    const { actionType, actionPayloadType } = this.submitActionTypes;

    return {
      requestTaskId,
      requestTaskActionType: actionType,
      requestTaskActionPayload: { payloadType: actionPayloadType },
    } as RequestTaskActionProcessDTO;
  }
}
