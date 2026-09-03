import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import {
  ButtonDirective,
  DateInputComponent,
  FormGroupComponent,
  TextareaComponent,
  TextInputComponent,
} from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { OPINION_STATEMENT_SUB_TASK, opinionStatementMap, OpinionStatementStep } from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  addVisitDateFormGroup,
  opinionStatementSiteVisitInPersonFormProvider,
} from '@requests/tasks/aer-verification-submit/subtasks/opinion-statement/opinion-statement-site-visit-in-person/opinion-statement-site-visit-in-person.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-opinion-statement-site-visit-in-person',
  imports: [
    ButtonDirective,
    DateInputComponent,
    TextInputComponent,
    TextareaComponent,
    ReactiveFormsModule,
    WizardStepComponent,
    FormGroupComponent,
  ],
  standalone: true,
  templateUrl: './opinion-statement-site-visit-in-person.component.html',
  providers: [opinionStatementSiteVisitInPersonFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpinionStatementSiteVisitInPersonComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = opinionStatementMap;

  get visitDatesFormArray(): FormArray {
    return this.formGroup.get('visitDates') as FormArray;
  }

  constructor() {
    this.visitDatesFormArray.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.visitDatesFormArray.controls.forEach((group) => group.updateValueAndValidity({ emitEvent: false }));
    });
  }

  addSiteVisit(): void {
    this.visitDatesFormArray.push(addVisitDateFormGroup());
  }

  onRemoveSiteVisit(index: number) {
    this.visitDatesFormArray.removeAt(index);
  }

  onSubmit() {
    this.service
      .saveSubtask(
        OPINION_STATEMENT_SUB_TASK,
        OpinionStatementStep.SITE_VISIT_IN_PERSON,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
