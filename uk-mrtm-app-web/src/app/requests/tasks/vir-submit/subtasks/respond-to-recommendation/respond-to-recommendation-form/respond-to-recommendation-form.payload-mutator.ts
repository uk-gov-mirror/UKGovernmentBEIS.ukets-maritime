import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { OperatorImprovementResponse } from '@mrtm/api';

import { PayloadMutator } from '@netz/common/forms';

import { TaskItemStatus } from '@requests/common';
import { RESPOND_TO_RECOMMENDATION_SUBTASK } from '@requests/common/vir';
import { VirRespondToRecommendationWizardStep } from '@requests/tasks/vir-submit/subtasks/respond-to-recommendation';
import { RespondToRecommendationFormModel } from '@requests/tasks/vir-submit/subtasks/respond-to-recommendation/respond-to-recommendation-form/respond-to-recommendation-form.types';
import { VirSubmitTaskPayload } from '@requests/tasks/vir-submit/vir-submit.types';
import { isNil } from '@shared/utils';

export class RespondToRecommendationFormPayloadMutator extends PayloadMutator {
  subtask: string = RESPOND_TO_RECOMMENDATION_SUBTASK;
  step: string = VirRespondToRecommendationWizardStep.RESPOND_TO;

  apply(
    currentPayload: VirSubmitTaskPayload,
    userInput: RespondToRecommendationFormModel,
  ): Observable<VirSubmitTaskPayload> {
    return of(
      produce(currentPayload, (payload: VirSubmitTaskPayload) => {
        const { key, ...formData } = userInput;

        if (isNil(payload?.operatorImprovementResponses)) {
          payload.operatorImprovementResponses = {};
        }

        payload.operatorImprovementResponses[key] = {
          ...(payload.operatorImprovementResponses[key] ?? {}),
          ...formData,
          addressedDate: formData.isAddressed ? formData.addressedDate : undefined,
        } as OperatorImprovementResponse;

        // Reset next 2 steps when there is a change in isAddressed
        if (currentPayload.operatorImprovementResponses[key]?.isAddressed !== formData.isAddressed) {
          delete payload.operatorImprovementResponses[key].uploadEvidence;
          delete payload.operatorImprovementResponses[key].files;
        }

        payload.sectionsCompleted[`${this.subtask}-${key}`] = TaskItemStatus.IN_PROGRESS;
      }),
    );
  }
}
