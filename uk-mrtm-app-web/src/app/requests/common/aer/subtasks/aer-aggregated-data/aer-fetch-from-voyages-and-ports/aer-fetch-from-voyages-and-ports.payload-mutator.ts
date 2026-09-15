import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { AerShipAggregatedData } from '@mrtm/api';

import { PayloadMutator } from '@netz/common/forms';

import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AER_AGGREGATED_DATA_SUB_TASK,
  AerAggregatedDataWizardStep,
} from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data.helpers';
import { getAerJourneyType } from '@requests/common/aer/subtasks/aer-voyages';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { AerJourneyTypeEnum } from '@shared/types';

export class AerFetchFromVoyagesAndPortsPayloadMutator extends PayloadMutator {
  public readonly subtask: string = AER_AGGREGATED_DATA_SUB_TASK;
  public readonly step: string = AerAggregatedDataWizardStep.FETCH_FROM_VOYAGES_AND_PORTS;

  public apply(currentPayload: AerSubmitTaskPayload): Observable<AerSubmitTaskPayload> {
    return of(
      produce(currentPayload, (payload: AerSubmitTaskPayload) => {
        const imoNumbers = Array.from(
          new Set<string>([
            ...(payload?.aer?.voyageEmissions?.voyages ?? [])
              .map((voyage) => ({ imoNumber: voyage.imoNumber, journeyType: getAerJourneyType(voyage?.voyageDetails) }))
              .filter((voyage) => [AerJourneyTypeEnum.Domestic, AerJourneyTypeEnum.NI].includes(voyage.journeyType))
              .map((voyage) => voyage.imoNumber),
            ...(payload?.aer?.portEmissions?.ports ?? []).map((port) => port.imoNumber),
          ]),
        );

        const fetchedAggregatedData = imoNumbers.map(
          (imoNumber) =>
            ({
              imoNumber,
              fromFetch: true,
              uniqueIdentifier: crypto.randomUUID(),
            }) as AerShipAggregatedData,
        );

        payload.aer.aggregatedData = {
          emissions: fetchedAggregatedData,
        };

        payload.aerSectionsCompleted[this.subtask] = TaskItemStatus.IN_PROGRESS;

        const validKeys = payload.aer.aggregatedData.emissions.map(
          (aggregatedData) => `${this.subtask}-aggregated-data-${aggregatedData.uniqueIdentifier}`,
        );

        for (const key of Object.keys(payload.aerSectionsCompleted)) {
          if (key.startsWith(`${this.subtask}-aggregated-data-`) && !validKeys.includes(key)) {
            delete payload.aerSectionsCompleted[key];
          }
        }

        for (const fetchData of fetchedAggregatedData) {
          payload.aerSectionsCompleted[`${this.subtask}-aggregated-data-${fetchData.uniqueIdentifier}`] =
            TaskItemStatus.COMPLETED;
        }
      }),
    );
  }
}
