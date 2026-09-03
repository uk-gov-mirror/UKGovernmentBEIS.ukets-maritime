import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import {
  ConditionalContentDirective,
  DateInputComponent,
  FieldsetDirective,
  LegendDirective,
  RadioComponent,
  RadioOptionComponent,
  TextareaComponent,
} from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { RESPOND_TO_OPERATOR_SUBTASK, virSubtaskList } from '@requests/common/vir';
import { virCommonQuery } from '@requests/common/vir/+state';
import { VirRespondToOperatorWizardStep } from '@requests/tasks/vir-review/subtasks/respond-to-operator/respond-to-operator.helpers';
import { respondToOperatorFormProvider } from '@requests/tasks/vir-review/subtasks/respond-to-operator/respond-to-operator-form/respond-to-operator-form.provider';
import { RespondToOperatorFormGroupModel } from '@requests/tasks/vir-review/subtasks/respond-to-operator/respond-to-operator-form/respond-to-operator-form.types';
import { VirVerifierRecommendationSummaryTemplateComponent, WizardStepComponent } from '@shared/components';
import { VirOperatorResponseSummaryTemplateComponent } from '@shared/components/summaries/vir-operator-response-summary-template';

@Component({
  selector: 'mrtm-respond-to-operator-form',
  imports: [
    WizardStepComponent,
    UpperCasePipe,
    VirVerifierRecommendationSummaryTemplateComponent,
    VirOperatorResponseSummaryTemplateComponent,
    ConditionalContentDirective,
    DateInputComponent,
    FieldsetDirective,
    LegendDirective,
    RadioComponent,
    RadioOptionComponent,
    TextareaComponent,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './respond-to-operator-form.component.html',
  providers: [respondToOperatorFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RespondToOperatorFormComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly service = inject(TaskService);
  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly formGroup: FormGroup<RespondToOperatorFormGroupModel> = inject(TASK_FORM);
  public readonly key = input<string>();

  public readonly verificationData = computed(() => {
    const key = this.key();
    const data = this.store.select(virCommonQuery.selectVirVerifierRecommendationDataByKey(key))();
    return {
      ...data,
      reference: `${data?.reference}: ${virSubtaskList[data?.verificationDataKey]?.title}`,
    };
  });

  public readonly operatorResponse = computed(() => {
    const key = this.key();

    return this.store.select(virCommonQuery.selectOperatorResponseSummaryData(key))();
  });

  public onSubmit(): void {
    this.service
      .saveSubtask(
        RESPOND_TO_OPERATOR_SUBTASK,
        VirRespondToOperatorWizardStep.RESPOND_TO,
        this.activatedRoute,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
