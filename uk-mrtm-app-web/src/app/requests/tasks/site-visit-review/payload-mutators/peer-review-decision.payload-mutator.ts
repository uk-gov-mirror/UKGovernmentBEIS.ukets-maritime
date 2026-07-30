import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { PeerReviewDecision, SiteVisitApplicationReviewRequestTaskPayload } from '@mrtm/api';

import { PayloadMutator } from '@netz/common/forms';

import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import {
  PEER_REVIEW_DECISION_SUB_TASK,
  PeerReviewWizardStep,
} from '@requests/common/subtasks/peer-review-decision/peer-review-decision.helper';
import { TaskItemStatus } from '@requests/common/task-item-status';

export class PeerReviewDecisionPayloadMutator extends PayloadMutator {
  subtask = PEER_REVIEW_DECISION_SUB_TASK;
  step: PeerReviewWizardStep.DECISION;

  override apply(
    currentPayload: SiteVisitApplicationReviewRequestTaskPayload & { decision: PeerReviewDecision },
    userInput: PeerReviewDecision,
  ): Observable<EmpTaskPayload> {
    return of(
      produce(currentPayload, (payload) => {
        payload.decision = userInput;
        payload.sectionsCompleted[this.subtask] = TaskItemStatus.IN_PROGRESS;
      }),
    );
  }
}
