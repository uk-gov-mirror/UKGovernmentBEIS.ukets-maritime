import { inject } from '@angular/core';

import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { PayloadMutator } from '@netz/common/forms';

import { AerSubmitTaskPayload, AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { EMISSIONS_REDUCTION_CLAIMS_VERIFICATION_SUB_TASK } from '@requests/common/aer/subtasks/emissions-reduction-claim-verification';
import { TaskItemStatus } from '@requests/common/task-item-status';
import {
  IMPORT_THIRD_PARTY_DATA_PROVIDER_SUB_TASK,
  SUBTASKS_AFFECTED_BY_IMPORT,
} from '@requests/common/third-party-data-provider/third-party-data-provider.const';
import { ThirdPartyDataProviderPayload } from '@requests/common/third-party-data-provider/third-party-data-provider.types';
import { isNil } from '@shared/utils';

export class ThirdPartyDataProviderImportPayloadMutator extends PayloadMutator {
  private readonly affectedTasks = inject(SUBTASKS_AFFECTED_BY_IMPORT);
  readonly subtask = IMPORT_THIRD_PARTY_DATA_PROVIDER_SUB_TASK;
  readonly step = null;

  apply(
    currentPayload: AerSubmitTaskPayload,
    userInput: ThirdPartyDataProviderPayload,
  ): Observable<AerSubmitTaskPayload> {
    return of(
      produce(currentPayload, (payload: AerVerificationSubmitTaskPayload) => {
        for (const subtask of this.affectedTasks) {
          if (
            subtask === EMISSIONS_REDUCTION_CLAIMS_VERIFICATION_SUB_TASK &&
            ((!payload?.aer?.smf?.exist && !isNil(userInput?.['emissionsReductionClaimVerification'])) ||
              (payload?.aer?.smf?.exist && isNil(userInput?.['emissionsReductionClaimVerification'])))
          ) {
            payload.verificationSectionsCompleted[subtask] = TaskItemStatus.NOT_STARTED;
            continue;
          }

          payload.verificationReport[subtask] = userInput[subtask];
          payload.verificationSectionsCompleted[subtask] = TaskItemStatus.COMPLETED;
        }
      }),
    );
  }
}
