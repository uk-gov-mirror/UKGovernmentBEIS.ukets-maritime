import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { TextareaComponent } from '@netz/govuk-components';

import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import {
  APPLICATION_DETAILS_SUBTASK,
  ApplicationDetailsWizardSteps,
} from '@requests/common/site-visit/subtasks/application-details';
import { provideEvidenceRequestTypeForm } from '@requests/common/site-visit/subtasks/application-details/application-details-evidence/application-details-evidence.form-provider';
import { siteVisitSubtasksMap } from '@requests/common/site-visit/subtasks/site-visit.subtasks-map';
import { TASK_FORM } from '@requests/common/task-form.token';
import {
  MultipleFileInputComponent,
  SiteVisitReportingYearSummaryTemplateComponent,
  WizardStepComponent,
} from '@shared/components';

@Component({
  selector: 'mrtm-application-details-evidence',
  imports: [
    SiteVisitReportingYearSummaryTemplateComponent,
    WizardStepComponent,
    MultipleFileInputComponent,
    ReactiveFormsModule,
    TextareaComponent,
  ],
  templateUrl: './application-details-evidence.component.html',
  providers: [provideEvidenceRequestTypeForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailsEvidenceComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly service = inject(TaskService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly subtaskMap = siteVisitSubtasksMap.applicationDetails;
  readonly formGroup = inject(TASK_FORM);
  readonly reportingYear = this.store.select(siteVisitCommonQuery.selectYear);
  readonly downloadUrl = this.store.select(requestTaskQuery.selectTasksDownloadUrl);

  onSubmit(): void {
    this.service
      .saveSubtask(
        APPLICATION_DETAILS_SUBTASK,
        ApplicationDetailsWizardSteps.EVIDENCE,
        this.activatedRoute,
        this.formGroup.value,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
