import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { SideEffect, SubtaskOperation } from '@netz/common/forms';

import { SiteVisitCommonTaskPayload } from '@requests/common/site-visit/site-visit-common.types';
import { APPLICATION_DETAILS_SUBTASK } from '@requests/common/site-visit/subtasks/application-details';
import { TaskItemStatus } from '@requests/common/task-item-status';

export class ApplicationDetailsSummarySideEffect extends SideEffect {
  readonly subtask = APPLICATION_DETAILS_SUBTASK;
  readonly step = null;
  readonly on: SubtaskOperation[] = ['SUBMIT_SUBTASK'];

  apply(currentPayload: SiteVisitCommonTaskPayload): Observable<SiteVisitCommonTaskPayload> {
    return of(
      produce(currentPayload, (payload) => {
        payload.sectionsCompleted[this.subtask] = TaskItemStatus.COMPLETED;
      }),
    );
  }
}
