import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { SiteVisitApplicationReviewRequestTaskPayload } from '@mrtm/api';

import { SideEffect, SubtaskOperation } from '@netz/common/forms';

import { APPLICATION_DETAILS_SUBTASK } from '@requests/common/site-visit/subtasks/application-details';
import { TaskItemStatus } from '@requests/common/task-item-status';

export class ApplicationDetailsDecisionSummarySideEffect extends SideEffect {
  step = undefined;
  subtask = APPLICATION_DETAILS_SUBTASK;
  on: SubtaskOperation[] = ['SUBMIT_SUBTASK'];

  override apply(
    currentPayload: SiteVisitApplicationReviewRequestTaskPayload,
  ): Observable<SiteVisitApplicationReviewRequestTaskPayload> {
    return of(
      produce(currentPayload, (payload) => {
        payload.sectionsCompleted[this.subtask] = TaskItemStatus.COMPLETED;
      }),
    );
  }
}
