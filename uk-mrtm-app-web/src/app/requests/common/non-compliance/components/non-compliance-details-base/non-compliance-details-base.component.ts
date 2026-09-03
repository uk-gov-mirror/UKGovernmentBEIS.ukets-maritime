import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { DateInputComponent, GovukSelectOption, SelectComponent, TextareaComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { nonComplianceDetailsBaseProvider } from '@requests/common/non-compliance/components/non-compliance-details-base/non-compliance-details-base.form-provider';
import { NON_COMPLIANCE_AMEND_DETAILS_SUB_TASK } from '@requests/common/non-compliance/non-compliance-amend-details/non-compliance-amend-details.const';
import { NonComplianceAmendDetailsService } from '@requests/common/non-compliance/non-compliance-amend-details/services/non-compliance-amend-details.service';
import {
  NON_COMPLIANCE_DETAILS_SUB_TASK,
  NonComplianceDetailsStep,
} from '@requests/common/non-compliance/non-compliance-details/non-compliance-details.helpers';
import { nonComplianceDetailsMap } from '@requests/common/non-compliance/non-compliance-details/non-compliance-details-subtask-list.map';
import { WizardStepComponent } from '@shared/components';
import { NonComplianceReasonPipe } from '@shared/pipes';
import { NON_COMPLIANCE_REASON_TYPES, NonComplianceReason } from '@shared/types';

@Component({
  selector: 'mrtm-non-compliance-details-base',
  imports: [DateInputComponent, SelectComponent, TextareaComponent, ReactiveFormsModule, WizardStepComponent],
  standalone: true,
  templateUrl: './non-compliance-details-base.component.html',
  providers: [nonComplianceDetailsBaseProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonComplianceDetailsBaseComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly store = inject(RequestTaskStore);
  private readonly service = inject(TaskService);
  private readonly route = inject(ActivatedRoute);
  readonly map = nonComplianceDetailsMap;
  private readonly nonComplianceReasonPipe = new NonComplianceReasonPipe();
  private readonly requestTaskType = this.store.select(requestTaskQuery.selectRequestTaskType);

  readonly isAmend = computed<boolean>(() => this.requestTaskType() !== 'NON_COMPLIANCE_APPLICATION_SUBMIT');

  readonly reasonOptions: GovukSelectOption<NonComplianceReason>[] = NON_COMPLIANCE_REASON_TYPES.map((value) => ({
    value,
    text: this.nonComplianceReasonPipe.transform(value),
  }));

  onSubmit() {
    if (this.isAmend()) {
      (this.service as NonComplianceAmendDetailsService)
        .saveAmendDetails(NON_COMPLIANCE_AMEND_DETAILS_SUB_TASK, null, this.route, this.formGroup.value)
        .pipe(take(1))
        .subscribe();
    } else {
      this.service
        .saveSubtask(
          NON_COMPLIANCE_DETAILS_SUB_TASK,
          NonComplianceDetailsStep.DETAILS_FORM,
          this.route,
          this.formGroup.value,
        )
        .pipe(take(1))
        .subscribe();
    }
  }
}
