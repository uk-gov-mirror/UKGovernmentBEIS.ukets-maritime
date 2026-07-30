import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TaskService } from '@netz/common/forms';
import { RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import {
  OPERATOR_DETAILS_SUB_TASK,
  operatorDetailsMap,
  OperatorDetailsWizardStep,
} from '@requests/common/components/operator-details';
import { LEGAL_STATUS_TYPES } from '@requests/common/components/operator-details/legal-status-of-organisation/legal-status-of-organisation.constants';
import { legalStatusOfOrganisationFormProvider } from '@requests/common/components/operator-details/legal-status-of-organisation/legal-status-of-organisation.form-provider';
import { TASK_FORM } from '@requests/common/task-form.token';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-legal-status-of-organisation',
  imports: [ReactiveFormsModule, WizardStepComponent, RadioComponent, RadioOptionComponent],
  standalone: true,
  templateUrl: './legal-status-of-organisation.component.html',
  providers: [legalStatusOfOrganisationFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalStatusOfOrganisationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService);

  readonly formGroup = inject(TASK_FORM);
  readonly radioGroupOptions = LEGAL_STATUS_TYPES;
  readonly operatorDetailsMap = operatorDetailsMap;

  onSubmit() {
    this.service
      .saveSubtask(
        OPERATOR_DETAILS_SUB_TASK,
        OperatorDetailsWizardStep.OPERATOR_DETAILS_LEGAL_STATUS_OF_ORGANISATION,
        this.route,
        this.formGroup.value,
      )
      .subscribe();
  }
}
