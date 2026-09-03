import { Provider } from '@angular/core';

import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import {
  EmissionsMonitoringPlan,
  EmpIssuanceApplicationReviewRequestTaskPayload,
  EmpVariationApplicationReviewRequestTaskPayload,
} from '@mrtm/api';

import { SIDE_EFFECTS, SideEffect } from '@netz/common/forms';

import { OVERALL_DECISION_SUB_TASK } from '@requests/common/emp/subtasks/overall-decision';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils/subtask-review-group.map';
import { TaskItemStatus } from '@requests/common/task-item-status';

export const provideEmpReviewSideEffect = (empSubtask: keyof EmissionsMonitoringPlan): Provider => ({
  provide: SIDE_EFFECTS,
  multi: true,
  useFactory: () => {
    return {
      subtask: empSubtask,
      step: undefined,
      on: ['SUBMIT_SUBTASK'],

      apply: (
        currentPayload:
          EmpIssuanceApplicationReviewRequestTaskPayload | EmpVariationApplicationReviewRequestTaskPayload,
      ): Observable<any> => {
        return of(
          produce(currentPayload, (payload) => {
            payload.empSectionsCompleted[empSubtask] =
              currentPayload?.reviewGroupDecisions?.[subtaskReviewGroupMap[empSubtask]]?.type;

            if (
              [TaskItemStatus.REJECTED, TaskItemStatus.APPROVED].includes(
                currentPayload?.determination?.type as TaskItemStatus,
              )
            ) {
              delete payload.determination;
              delete payload.empSectionsCompleted[OVERALL_DECISION_SUB_TASK];
            }
          }),
        );
      },
    } as SideEffect;
  },
});
