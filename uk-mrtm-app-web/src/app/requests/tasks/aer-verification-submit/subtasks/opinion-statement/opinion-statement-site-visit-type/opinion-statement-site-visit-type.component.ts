import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { OPINION_STATEMENT_SUB_TASK, opinionStatementMap, OpinionStatementStep } from '@requests/common/aer';
import { AER_SITE_VISIT_TYPES } from '@requests/common/aer/aer.consts';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { opinionStatementSiteVisitTypeFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/opinion-statement/opinion-statement-site-visit-type/opinion-statement-site-visit-type.form-provider';
import { WizardStepComponent } from '@shared/components';
import { AerSiteVisitTypeToLabelPipe } from '@shared/pipes';

@Component({
  selector: 'mrtm-opinion-statement-site-visit-type',
  imports: [
    AerSiteVisitTypeToLabelPipe,
    RadioComponent,
    RadioOptionComponent,
    ReactiveFormsModule,
    WizardStepComponent,
  ],
  standalone: true,
  templateUrl: './opinion-statement-site-visit-type.component.html',
  providers: [opinionStatementSiteVisitTypeFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpinionStatementSiteVisitTypeComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = opinionStatementMap;
  readonly siteVisitTypeOptions = AER_SITE_VISIT_TYPES;

  onSubmit() {
    this.service
      .saveSubtask(OPINION_STATEMENT_SUB_TASK, OpinionStatementStep.SITE_VISIT_TYPE, this.route, this.formGroup.value)
      .pipe(take(1))
      .subscribe();
  }
}
