import { inject } from '@angular/core';

import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { PayloadMutator } from '@netz/common/forms';

import { EmpVariationTaskPayload } from '@requests/common';
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
    currentPayload: EmpVariationTaskPayload,
    userInput: ThirdPartyDataProviderPayload,
  ): Observable<EmpVariationTaskPayload> {
    return of(
      produce(currentPayload, (payload: EmpVariationTaskPayload) => {
        this.affectedTasks.forEach((subtask) => {
          payload.emissionsMonitoringPlan[subtask] = userInput[subtask];
          payload.empSectionsCompleted[subtask] = TaskItemStatus.COMPLETED;

          if (subtask === EMISSIONS_SUB_TASK) {
            Object.keys(payload.empSectionsCompleted).forEach((key) => {
              if (key.startsWith(`${EMISSIONS_SUB_TASK}-ship-`)) {
                delete payload.empSectionsCompleted[key];
              }
            });
            userInput[EMISSIONS_SUB_TASK].ships.forEach((ship) => {
              payload.empSectionsCompleted[`${EMISSIONS_SUB_TASK}-ship-${ship.uniqueIdentifier}`] =
                TaskItemStatus.COMPLETED;
            });
          }
        });
      }),
    );
  }
}
