import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import {
  ConditionalContentDirective,
  RadioComponent,
  RadioOptionComponent,
  TextareaComponent,
} from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  COMPLIANCE_MONITORING_REPORTING_SUB_TASK,
  complianceMonitoringReportingMap,
  ComplianceMonitoringReportingStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { complianceMonitoringReportingCompletenessFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/compliance-monitoring-reporting/compliance-monitoring-reporting-completeness/compliance-monitoring-reporting-completeness.form-provider';
import { WizardStepComponent } from '@shared/components';
import { ComplianceToTextPipe } from '@shared/pipes';

@Component({
  selector: 'mrtm-compliance-monitoring-reporting-completeness',
  imports: [
    ConditionalContentDirective,
    TextareaComponent,
    RadioComponent,
    RadioOptionComponent,
    ReactiveFormsModule,
    WizardStepComponent,
    ComplianceToTextPipe,
  ],
  standalone: true,
  templateUrl: './compliance-monitoring-reporting-completeness.component.html',
  providers: [complianceMonitoringReportingCompletenessFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplianceMonitoringReportingCompletenessComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = complianceMonitoringReportingMap;

  onSubmit() {
    this.service
      .saveSubtask(
        COMPLIANCE_MONITORING_REPORTING_SUB_TASK,
        ComplianceMonitoringReportingStep.COMPLETENESS,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
