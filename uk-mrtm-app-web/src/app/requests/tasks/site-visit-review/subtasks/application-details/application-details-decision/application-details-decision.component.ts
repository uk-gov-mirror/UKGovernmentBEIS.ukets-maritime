import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { startWith } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import {
  ButtonDirective,
  ConditionalContentDirective,
  FieldsetDirective,
  LegendDirective,
  RadioComponent,
  RadioOptionComponent,
  TextareaComponent,
} from '@netz/govuk-components';

import { TASK_FORM, TaskItemStatus } from '@requests/common';
import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import {
  APPLICATION_DETAILS_SUBTASK,
  ApplicationDetailsWizardSteps,
} from '@requests/common/site-visit/subtasks/application-details';
import { siteVisitSubtasksMap } from '@requests/common/site-visit/subtasks/site-visit.subtasks-map';
import { createAnotherRequiredChange } from '@requests/tasks/emp-review/components';
import { SiteVisitReviewService } from '@requests/tasks/site-visit-review/services';
import { applicationDetailsDecisionFormProvider } from '@requests/tasks/site-visit-review/subtasks/application-details/application-details-decision/application-details-decision.form-provider';
import { MultipleFileInputComponent, SiteVisitSummaryTemplateComponent, WizardStepComponent } from '@shared/components';
import { RequestTaskFileService } from '@shared/services';
import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-application-details-decision',
  imports: [
    WizardStepComponent,
    SiteVisitSummaryTemplateComponent,
    ButtonDirective,
    ConditionalContentDirective,
    FieldsetDirective,
    LegendDirective,
    MultipleFileInputComponent,
    RadioComponent,
    RadioOptionComponent,
    ReactiveFormsModule,
    TextareaComponent,
  ],
  templateUrl: './application-details-decision.component.html',
  providers: [applicationDetailsDecisionFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailsDecisionComponent implements OnInit {
  private readonly store = inject(RequestTaskStore);
  private readonly requestTaskFileService = inject(RequestTaskFileService);
  private readonly service = inject(TaskService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly map = siteVisitSubtasksMap;
  readonly form = inject(TASK_FORM);
  readonly siteVisit = this.store.select(siteVisitCommonQuery.selectSiteVisitSummary);
  readonly downloadUrl = this.store.select(requestTaskQuery.selectTasksDownloadUrl)();

  get requiredChangesCtrl(): FormArray {
    return this.form.controls.requiredChanges as FormArray;
  }

  ngOnInit(): void {
    this.form
      .get('type')
      ?.valueChanges.pipe(startWith(this.form.get('type')?.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value === TaskItemStatus.OPERATOR_AMENDS_NEEDED || isNil(value)) {
          this.form.get('summary')?.disable();
          this.form.get('summary')?.setValue('');
        } else {
          this.form.get('summary')?.enable();
        }
      });
  }

  addOtherRequiredChange(): void {
    this.requiredChangesCtrl.push(createAnotherRequiredChange(this.store, this.requestTaskFileService));
  }

  onSubmit(): void {
    (this.service as SiteVisitReviewService)
      .saveReviewDecision(
        APPLICATION_DETAILS_SUBTASK,
        ApplicationDetailsWizardSteps.DECISION,
        this.route,
        this.form.value,
      )
      .subscribe();
  }
}
