import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { PayloadMutator } from '@netz/common/forms';

import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { AerEmissionsWizardStep } from '@requests/common/aer/subtasks/aer-emissions/aer-emissions.helpers';
import { EMISSION_SOURCES_AND_FUEL_TYPES_USED_FORM_STEP } from '@requests/common/components/emissions/emission-sources-and-fuel-types-used-form/emission-sources-and-fuel-types-used-form.helper';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';

export class AerEmissionSourcesAndFuelTypesUsedListPayloadMutator extends PayloadMutator {
  readonly subtask = EMISSIONS_SUB_TASK;
  step = AerEmissionsWizardStep.EMISSION_SOURCES_LIST;

  apply(currentPayload: AerSubmitTaskPayload, userInput: string | string[]): Observable<any> {
    return of(
      produce(currentPayload, (payload: AerSubmitTaskPayload) => {
        // An array of ids means "these needsReview entries are now valid" (see
        // AerEmissionSourcesAndFuelTypesUsedListComponent.onContinue) rather than "delete this entry".
        if (Array.isArray(userInput)) {
          for (const uniqueIdentifier of userInput) {
            delete payload.aerSectionsCompleted[
              `${EMISSION_SOURCES_AND_FUEL_TYPES_USED_FORM_STEP}-${uniqueIdentifier}`
            ];
          }
          return;
        }

        payload.aer[this.subtask].ships = [
          ...payload.aer[this.subtask].ships.map((ship) => ({
            ...ship,
            emissionsSources: ship.emissionsSources.filter((source) => source.uniqueIdentifier !== userInput),
          })),
        ];

        delete payload.aerSectionsCompleted[`${EMISSION_SOURCES_AND_FUEL_TYPES_USED_FORM_STEP}-${userInput}`];
      }),
    );
  }
}
