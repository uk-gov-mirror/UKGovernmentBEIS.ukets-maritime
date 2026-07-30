import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { SiteVisitApplicationReviewRequestTaskPayload } from '@mrtm/api';

import { PayloadMutator } from '@netz/common/forms';

import { TaskItemStatus } from '@requests/common';
import {
  APPLICATION_DETAILS_SUBTASK,
  ApplicationDetailsWizardSteps,
} from '@requests/common/site-visit/subtasks/application-details';
import { ReviewDecisionFormModel } from '@requests/tasks/emp-review/components';
import { transformToTaskAttachments } from '@shared/utils';

export class ApplicationDetailsDecisionPayloadMutator extends PayloadMutator {
  subtask = APPLICATION_DETAILS_SUBTASK;
  step = ApplicationDetailsWizardSteps.DECISION;

  override apply(
    currentPayload: SiteVisitApplicationReviewRequestTaskPayload,
    userInput: ReviewDecisionFormModel['value'],
  ): Observable<SiteVisitApplicationReviewRequestTaskPayload> {
    return of(
      produce(currentPayload, (payload) => {
        const totalFiles = userInput?.requiredChanges?.map((change) => change?.files).flat();

        payload.reviewDecision = {
          type: userInput.type,
          details: {
            notes: userInput.notes,
            summary: userInput.type === TaskItemStatus.OPERATOR_AMENDS_NEEDED ? undefined : (userInput as any).summary,
            ...(userInput.type === TaskItemStatus.OPERATOR_AMENDS_NEEDED
              ? {
                  requiredChanges: userInput.requiredChanges.map((requiredChange) => ({
                    reason: requiredChange.reason,
                    files: requiredChange.files.map((file) => file.uuid),
                  })),
                }
              : null),
          } as any,
        };
        payload.reviewAttachments = {
          ...payload.reviewAttachments,
          ...transformToTaskAttachments(totalFiles),
        };
        payload.sectionsCompleted[this.subtask] = TaskItemStatus.IN_PROGRESS;
      }),
    );
  }
}
