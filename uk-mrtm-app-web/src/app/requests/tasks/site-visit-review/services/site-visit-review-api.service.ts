import { inject, Injectable } from '@angular/core';

import { catchError, map, Observable, throwError } from 'rxjs';

import {
  PeerReviewDecisionRequestTaskActionPayload,
  RequestTaskActionProcessDTO,
  SiteVisitApplicationReviewRequestTaskPayload,
  SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload,
} from '@mrtm/api';

import { BusinessErrorService, ErrorCodes, taskNotFoundError } from '@netz/common/error';
import { TaskApiService } from '@netz/common/forms';
import { PendingRequestService } from '@netz/common/services';
import { requestTaskQuery } from '@netz/common/store';

import { EmpReviewTaskPayload } from '@requests/common';

@Injectable()
export class SiteVisitReviewApiService extends TaskApiService<SiteVisitApplicationReviewRequestTaskPayload> {
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly businessErrorService = inject(BusinessErrorService);

  private get saveActionTypes() {
    const requestTaskType = this.store.select(requestTaskQuery.selectRequestTaskType)();

    switch (requestTaskType) {
      case 'SITE_VISIT_APPLICATION_PEER_REVIEW':
        return {
          actionType: 'SITE_VISIT_REVIEW_SUBMIT_PEER_REVIEW_DECISION',
          actionPayloadType: 'SITE_VISIT_REVIEW_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD',
        };
      default:
        return {
          actionType: 'SITE_VISIT_SAVE_REVIEW_GROUP_DECISION',
          actionPayloadType: 'SITE_VISIT_SAVE_REVIEW_GROUP_DECISION_PAYLOAD',
        };
    }
  }

  public save(
    payload: SiteVisitApplicationReviewRequestTaskPayload,
  ): Observable<SiteVisitApplicationReviewRequestTaskPayload> {
    const { actionType } = this.saveActionTypes;
    const requestTaskActionProcessDTO: RequestTaskActionProcessDTO & {
      requestTaskActionPayload: any;
    } = {
      requestTaskId: this.store.select(requestTaskQuery.selectRequestTaskId)(),
      requestTaskActionType: actionType,
      requestTaskActionPayload: this.createSaveAction(payload),
    };
    return this.processTaskAction(requestTaskActionProcessDTO, payload);
  }

  public saveReviewDecision(payload: SiteVisitApplicationReviewRequestTaskPayload) {
    const requestTaskId = this.store.select(requestTaskQuery.selectRequestTaskId)();
    const requestPayload: RequestTaskActionProcessDTO & {
      requestTaskActionPayload: SiteVisitSaveReviewGroupDecisionRequestTaskActionPayload;
    } = {
      requestTaskId,
      requestTaskActionType: 'SITE_VISIT_SAVE_REVIEW_GROUP_DECISION',
      requestTaskActionPayload: {
        payloadType: 'SITE_VISIT_SAVE_REVIEW_GROUP_DECISION_PAYLOAD',
        reviewDecision: payload.reviewDecision,
        sectionsCompleted: payload.sectionsCompleted,
      },
    };
    return this.processTaskAction(requestPayload, payload);
  }

  public sendForAmends(payload: SiteVisitApplicationReviewRequestTaskPayload) {
    const requestTaskActionProcessDTO: RequestTaskActionProcessDTO = {
      requestTaskId: this.store.select(requestTaskQuery.selectRequestTaskId)(),
      requestTaskActionType: 'SITE_VISIT_REVIEW_RETURN_FOR_AMENDS',
      requestTaskActionPayload: {
        payloadType: 'EMPTY_PAYLOAD',
      },
    };

    return this.processTaskAction(requestTaskActionProcessDTO, payload);
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

  private createSaveAction(payload: SiteVisitApplicationReviewRequestTaskPayload) {
    const { actionType, actionPayloadType } = this.saveActionTypes;

    switch (actionType) {
      case 'SITE_VISIT_REVIEW_SUBMIT_PEER_REVIEW_DECISION':
        return {
          payloadType: actionPayloadType,
          decision: (payload as any as PeerReviewDecisionRequestTaskActionPayload).decision,
        };
      default:
        return {
          payloadType: actionPayloadType,
          reviewDecision: payload.reviewDecision,
          sectionsCompleted: payload.sectionsCompleted,
        };
    }
  }
}
