import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { concatMap, Observable, tap } from 'rxjs';

import { SiteVisitApplicationReviewRequestTaskPayload } from '@mrtm/api';

import { IReturnForAmendsService } from '@requests/common/emp/return-for-amends';
import { BaseEmpService } from '@requests/common/emp/services';
import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';
import { SiteVisitReviewApiService } from '@requests/tasks/site-visit-review/services/site-visit-review-api.service';

@Injectable()
export class SiteVisitReviewService
  extends BaseEmpService<SiteVisitApplicationReviewRequestTaskPayload>
  implements IReturnForAmendsService<SiteVisitApplicationReviewRequestTaskPayload>
{
  get payload(): SiteVisitApplicationReviewRequestTaskPayload {
    return this.store.select(siteVisitReviewQuery.selectPayload)();
  }

  set payload(payload: SiteVisitApplicationReviewRequestTaskPayload) {
    this.store.setPayload(payload);
  }

  saveReviewDecision(subtask: string, step: string, route: ActivatedRoute, userInput: any): Observable<string> {
    return this.payloadMutators.mutate(subtask, step, this.payload, userInput).pipe(
      concatMap((payload) => this.sideEffects.apply(subtask, step, payload, 'SAVE_SUBTASK')),
      concatMap((payload) => (this.apiService as SiteVisitReviewApiService).saveReviewDecision(payload as any)),
      tap((payload) => (this.payload = payload)),
      concatMap(() => this.flowManagerForSubtask(subtask).nextStep(step, route)),
    );
  }

  sendForAmends(): Observable<SiteVisitApplicationReviewRequestTaskPayload> {
    return (this.apiService as SiteVisitReviewApiService).sendForAmends(this.payload);
  }
}
