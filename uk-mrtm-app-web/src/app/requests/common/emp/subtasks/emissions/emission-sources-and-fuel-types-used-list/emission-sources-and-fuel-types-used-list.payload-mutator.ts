import { Observable, of } from 'rxjs';
import { produce } from 'immer';

import { EmpEmissionsSources, EmpShipEmissions } from '@mrtm/api';

import { PayloadMutator } from '@netz/common/forms';

import { EMISSION_SOURCES_AND_FUEL_TYPES_USED_FORM_STEP } from '@requests/common/components/emissions/emission-sources-and-fuel-types-used-form/emission-sources-and-fuel-types-used-form.helper';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { EmissionsWizardStep } from '@requests/common/emp/subtasks/emissions/emissions.helpers';

export class EmissionSourcesAndFuelTypesUsedListPayloadMutator extends PayloadMutator {
  subtask = EMISSIONS_SUB_TASK;
  step = EmissionsWizardStep.EMISSION_SOURCES_LIST;

  apply(currentPayload: EmpTaskPayload, userInput: string | string[]): Observable<any> {
    return of(
      produce(currentPayload, (payload: EmpTaskPayload) => {
        // An array of ids means "these needsReview entries are now valid" (see
        // EmissionSourcesAndFuelTypesUsedListComponent.onContinue) rather than "delete this entry".
        if (Array.isArray(userInput)) {
          for (const uniqueIdentifier of userInput) {
            delete payload.empSectionsCompleted[
              `${EMISSION_SOURCES_AND_FUEL_TYPES_USED_FORM_STEP}-${uniqueIdentifier}`
            ];
          }
          return;
        }

        payload.emissionsMonitoringPlan[this.subtask].ships = [
          ...payload.emissionsMonitoringPlan[this.subtask].ships.map((ship: EmpShipEmissions) => ({
            ...ship,
            emissionsSources: ship.emissionsSources.filter(
              (source: EmpEmissionsSources) => source.uniqueIdentifier !== userInput,
            ),
          })),
        ];

        delete payload.empSectionsCompleted[`${EMISSION_SOURCES_AND_FUEL_TYPES_USED_FORM_STEP}-${userInput}`];
      }),
    );
  }
}
