import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { TextareaComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { OPINION_STATEMENT_SUB_TASK, opinionStatementMap, OpinionStatementStep } from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { opinionStatementSiteVisitVirtualFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/opinion-statement/opinion-statement-site-visit-virtual/opinion-statement-site-visit-virtual.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-opinion-statement-site-visit-virtual',
  imports: [TextareaComponent, ReactiveFormsModule, WizardStepComponent],
  standalone: true,
  templateUrl: './opinion-statement-site-visit-virtual.component.html',
  providers: [opinionStatementSiteVisitVirtualFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpinionStatementSiteVisitVirtualComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = opinionStatementMap;

  readonly hintHtml = `  
    <p class="govuk-body govuk-hint">You must explain:</p>
    <ul class="govuk-list govuk-list--bullet govuk-hint">
      <li>how the visit and verification were made from a technical perspective</li>
      <li>the measures taken to reduce the verification risk to an acceptable level</li>
      <li>the result of the risk analysis that meant a virtual verification could take place</li>
    </ul>`;

  onSubmit() {
    this.service
      .saveSubtask(
        OPINION_STATEMENT_SUB_TASK,
        OpinionStatementStep.SITE_VISIT_VIRTUAL,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
