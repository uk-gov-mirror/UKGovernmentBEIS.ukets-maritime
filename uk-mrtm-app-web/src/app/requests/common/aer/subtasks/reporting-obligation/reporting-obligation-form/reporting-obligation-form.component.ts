import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { map, startWith, take, tap } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { RadioComponent, RadioOptionComponent, TextareaComponent } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { reportingObligationMap } from '@requests/common/aer/subtasks/aer-subtasks-list.map';
import {
  REPORTING_OBLIGATION_SUB_TASK,
  ReportingObligationWizardStep,
} from '@requests/common/aer/subtasks/reporting-obligation/reporting-obligation.helpers';
import { reportingObligationFormProvider } from '@requests/common/aer/subtasks/reporting-obligation/reporting-obligation-form/reporting-obligation-form.form-provider';
import { TASK_FORM } from '@requests/common/task-form.token';
import { MultipleFileInputComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-reporting-obligation-form',
  imports: [
    MultipleFileInputComponent,
    RadioComponent,
    RadioOptionComponent,
    ReactiveFormsModule,
    TextareaComponent,
    WizardStepComponent,
  ],
  standalone: true,
  templateUrl: './reporting-obligation-form.component.html',
  providers: [reportingObligationFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportingObligationFormComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service: TaskService<AerSubmitTaskPayload> = inject(TaskService<AerSubmitTaskPayload>);
  private readonly store = inject(RequestTaskStore);
  protected readonly map = reportingObligationMap;
  private readonly year = this.store.select(aerCommonQuery.selectReportingYear);

  readonly reportingRequiredLegend = computed(() =>
    this.map.reportingRequired.title.replace('an annual', `a ${this.year()}`),
  );
  readonly shouldShowDetails = toSignal(
    this.formGroup.get('reportingRequired').valueChanges.pipe(
      startWith(this.formGroup.get('reportingRequired').value),
      map((reportingRequired) => reportingRequired === false),
      tap((shouldShowDetails) => {
        if (shouldShowDetails) {
          this.formGroup.get('noReportingReason').enable();
          this.formGroup.get('supportingDocuments').enable();
        } else {
          this.formGroup.get('noReportingReason').disable();
          this.formGroup.get('supportingDocuments').disable();
        }
      }),
    ),
  );

  downloadUrl = this.store.select(requestTaskQuery.selectTasksDownloadUrl);

  onSubmit() {
    this.service
      .saveSubtask(REPORTING_OBLIGATION_SUB_TASK, ReportingObligationWizardStep.FORM, this.route, this.formGroup.value)
      .pipe(take(1))
      .subscribe();
  }
}
