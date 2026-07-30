import { inject } from '@angular/core';

import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { PayloadMutator } from '@netz/common/forms';

import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { AER_AGGREGATED_DATA_SUB_TASK } from '@requests/common/aer/subtasks/aer-aggregated-data';
import { AER_REDUCTION_CLAIM_SUB_TASK } from '@requests/common/aer/subtasks/reduction-claim';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import {
  IMPORT_THIRD_PARTY_DATA_PROVIDER_SUB_TASK,
  SUBTASKS_AFFECTED_BY_IMPORT,
} from '@requests/common/third-party-data-provider/third-party-data-provider.const';
import { ThirdPartyDataProviderPayload } from '@requests/common/third-party-data-provider/third-party-data-provider.types';

export class ThirdPartyDataProviderImportPayloadMutator extends PayloadMutator {
  private readonly affectedTasks = inject(SUBTASKS_AFFECTED_BY_IMPORT);
  readonly subtask = IMPORT_THIRD_PARTY_DATA_PROVIDER_SUB_TASK;
  readonly step = null;

  apply(
    currentPayload: AerSubmitTaskPayload,
    userInput: ThirdPartyDataProviderPayload,
  ): Observable<AerSubmitTaskPayload> {
    return of(
      produce(currentPayload, (payload: AerSubmitTaskPayload) => {
        this.affectedTasks.forEach((subtask) => {
          payload.aer[subtask] = userInput[subtask];
          payload.aerSectionsCompleted[subtask] =
            subtask === AER_REDUCTION_CLAIM_SUB_TASK ? TaskItemStatus.IN_PROGRESS : TaskItemStatus.COMPLETED;

          if (subtask === EMISSIONS_SUB_TASK) {
            Object.keys(payload.aerSectionsCompleted).forEach((key) => {
              if (key.startsWith(`${EMISSIONS_SUB_TASK}-ship-`)) {
                delete payload.aerSectionsCompleted[key];
              }
            });
            userInput[EMISSIONS_SUB_TASK].ships.forEach((ship) => {
              payload.aerSectionsCompleted[`${EMISSIONS_SUB_TASK}-ship-${ship.uniqueIdentifier}`] =
                TaskItemStatus.COMPLETED;
            });
          }

          if (subtask === AER_AGGREGATED_DATA_SUB_TASK) {
            Object.keys(payload.aerSectionsCompleted).forEach((key) => {
              if (key.startsWith(`${AER_AGGREGATED_DATA_SUB_TASK}-aggregated-data-`)) {
                delete payload.aerSectionsCompleted[key];
              }
            });

            userInput[AER_AGGREGATED_DATA_SUB_TASK].emissions.forEach((data) => {
              payload.aerSectionsCompleted[`${AER_AGGREGATED_DATA_SUB_TASK}-aggregated-data-${data.uniqueIdentifier}`] =
                TaskItemStatus.COMPLETED;
            });
          }
        });
      }),
    );
  }
}
