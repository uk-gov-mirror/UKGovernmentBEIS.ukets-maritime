import { Observable, of } from 'rxjs';

import { WizardFlowManager } from '@netz/common/forms';

import { REQUESTED_CHANGES_SUB_TASK } from '@requests/common/emp/subtasks/requested-changes';
import { RequestedChangesWizardStep } from '@requests/common/emp/subtasks/requested-changes/requested-changes.helpers';

export class SiteVisitRequestedChangesFlowManager extends WizardFlowManager {
  subtask: string = REQUESTED_CHANGES_SUB_TASK;

  nextStepPath(currentStep: string): Observable<string> {
    switch (currentStep) {
      case RequestedChangesWizardStep.REQUESTED_CHANGES_AGREEMENT:
      default:
        return of('../../');
    }
  }
}
