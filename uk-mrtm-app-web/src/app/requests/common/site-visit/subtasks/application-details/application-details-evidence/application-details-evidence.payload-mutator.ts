import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { PayloadMutator } from '@netz/common/forms';

import { SiteVisitCommonTaskPayload } from '@requests/common/site-visit/site-visit-common.types';
import {
  APPLICATION_DETAILS_SUBTASK,
  ApplicationDetailsWizardSteps,
} from '@requests/common/site-visit/subtasks/application-details';
import { ApplicationDetailsEvidenceModel } from '@requests/common/site-visit/subtasks/application-details/application-details-evidence/application-details-evidence.types';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { createFileUploadPayload, transformToTaskAttachments } from '@shared/utils';

export class ApplicationDetailsEvidencePayloadMutator extends PayloadMutator {
  subtask: string = APPLICATION_DETAILS_SUBTASK;
  step: string = ApplicationDetailsWizardSteps.EVIDENCE;

  apply(
    currentPayload: SiteVisitCommonTaskPayload,
    userInput: ApplicationDetailsEvidenceModel,
  ): Observable<SiteVisitCommonTaskPayload> {
    return of(
      produce(currentPayload, (payload) => {
        if (!payload.siteVisit) {
          payload.siteVisit = {} as SiteVisitCommonTaskPayload['siteVisit'];
        }

        payload.siteVisit.applicationDetails = {
          ...userInput,
          files: createFileUploadPayload(userInput.files ?? []),
        };

        payload.siteVisitAttachments = {
          ...payload.siteVisitAttachments,
          ...transformToTaskAttachments(userInput.files ?? []),
        };

        payload.sectionsCompleted[this.subtask] = TaskItemStatus.IN_PROGRESS;
      }),
    );
  }
}
