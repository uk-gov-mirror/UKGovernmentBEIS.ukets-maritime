import { inject, Injectable } from '@angular/core';

import { catchError, map, Observable, throwError } from 'rxjs';

import { RequestTaskActionProcessDTO, SiteVisitApplicationReviewRequestTaskPayload } from '@mrtm/api';

import { BusinessErrorService, ErrorCodes, taskNotFoundError } from '@netz/common/error';
import { TaskApiService } from '@netz/common/forms';
import { PendingRequestService } from '@netz/common/services';
import { requestTaskQuery } from '@netz/common/store';

import { EmpReviewTaskPayload } from '@requests/common';
import { SiteVisitPeerReviewPayload } from '@requests/tasks/site-visit-peer-review/site-visit-peer-review.types';

@Injectable()
export class SiteVisitPeerReviewApiService extends TaskApiService<SiteVisitPeerReviewPayload> {
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly businessErrorService = inject(BusinessErrorService);

  private get saveActionTypes() {
    return {
      actionType: 'SITE_VISIT_REVIEW_SUBMIT_PEER_REVIEW_DECISION',
      actionPayloadType: 'SITE_VISIT_REVIEW_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD',
    };
  }

  public save(payload: SiteVisitPeerReviewPayload): Observable<SiteVisitPeerReviewPayload> {
    const { actionType, actionPayloadType } = this.saveActionTypes;

    return this.processTaskAction(
      {
        requestTaskId: this.store.select(requestTaskQuery.selectRequestTaskId)(),
        requestTaskActionType: actionType,
        requestTaskActionPayload: {
          payloadType: actionPayloadType,
          decision: payload?.decision,
        },
      } as RequestTaskActionProcessDTO,
      payload,
    );
  }

  submit(): Observable<void> {
    return throwError(() => new Error('Not yet implemented'));
  }

  private processTaskAction(
    requestTaskActionProcessDTO: RequestTaskActionProcessDTO,
    payload: SiteVisitApplicationReviewRequestTaskPayload,
  ) {
    return this.service.processRequestTaskAction(requestTaskActionProcessDTO).pipe(
      map((res: EmpReviewTaskPayload) => ({ ...payload, determination: res?.determination })),
      catchError((err) => {
        if (err.code === ErrorCodes.NOTFOUND1001) {
          this.businessErrorService.showErrorForceNavigation(taskNotFoundError);
        }
        return throwError(() => err);
      }),
      this.pendingRequestService.trackRequest(),
    );
  }
}
