import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { WizardFlowManager } from '@netz/common/forms';

import {
  APPLICATION_DETAILS_SUBTASK,
  ApplicationDetailsWizardSteps,
} from '@requests/common/site-visit/subtasks/application-details/application-details.helpers';

@Injectable()
export class ApplicationDetailsFlowManager extends WizardFlowManager {
  subtask: string = APPLICATION_DETAILS_SUBTASK;

  nextStepPath(currentStep: string): Observable<string> {
    switch (currentStep) {
      case ApplicationDetailsWizardSteps.EVIDENCE:
      case ApplicationDetailsWizardSteps.DECISION:
        return of(ApplicationDetailsWizardSteps.SUMMARY);
      default:
        return of('../../');
    }
  }
}
