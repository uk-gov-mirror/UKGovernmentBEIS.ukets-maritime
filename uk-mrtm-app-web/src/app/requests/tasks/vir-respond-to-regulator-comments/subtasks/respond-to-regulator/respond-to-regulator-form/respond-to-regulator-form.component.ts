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
import { RESPOND_TO_REGULATOR_SUBTASK, virSubtaskList } from '@requests/common/vir';
import { virCommonQuery } from '@requests/common/vir/+state';
import { virRespondToRegulatorCommentsQuery } from '@requests/tasks/vir-respond-to-regulator-comments/+state';
import { VirRespondToRegulatorService } from '@requests/tasks/vir-respond-to-regulator-comments/services';
import { VirRespondToRegulatorWizardStep } from '@requests/tasks/vir-respond-to-regulator-comments/subtasks/respond-to-regulator';
import { respondToRegulatorFormProvider } from '@requests/tasks/vir-respond-to-regulator-comments/subtasks/respond-to-regulator/respond-to-regulator-form/respond-to-regulator-form.provider';
import {
  VirRegulatorResponseOperatorSideSummaryTemplateComponent,
  VirVerifierRecommendationSummaryTemplateComponent,
  WizardStepComponent,
} from '@shared/components';
import { VirOperatorResponseSummaryTemplateComponent } from '@shared/components/summaries/vir-operator-response-summary-template';

@Component({
  selector: 'mrtm-respond-to-recommendation-form',
  imports: [
    WizardStepComponent,
    VirVerifierRecommendationSummaryTemplateComponent,
    ReactiveFormsModule,
    FieldsetDirective,
    RadioComponent,
    RadioOptionComponent,
    LegendDirective,
    TextareaComponent,
    DateInputComponent,
    ConditionalContentDirective,
    UpperCasePipe,
    VirOperatorResponseSummaryTemplateComponent,
    VirRegulatorResponseOperatorSideSummaryTemplateComponent,
  ],
  standalone: true,
  templateUrl: './respond-to-regulator-form.component.html',
  providers: [respondToRegulatorFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RespondToRegulatorFormComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly service: VirRespondToRegulatorService = inject(TaskService) as VirRespondToRegulatorService;
  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly formGroup: FormGroup = inject(TASK_FORM);
  public readonly key = input<string>();

  public readonly verificationData = computed(() => {
    const key = this.key();
    const data = this.store.select(virCommonQuery.selectVirVerifierRecommendationDataByKey(key))();
    return {
      ...data,
      reference: `${data?.reference}: ${virSubtaskList[data?.verificationDataKey]?.title}`,
    };
  });

  public readonly operatorResponseData = computed(() =>
    this.store.select(virCommonQuery.selectOperatorResponseSummaryData(this.key()))(),
  );

  public readonly regulatorResponseData = computed(() =>
    this.store.select(virRespondToRegulatorCommentsQuery.selectRegulatorResponseData(this.key()))(),
  );

  public onSubmit(): void {
    this.service
      .saveOperatorImprovement(
        RESPOND_TO_REGULATOR_SUBTASK,
        VirRespondToRegulatorWizardStep.FORM,
        this.activatedRoute,
        this.key(),
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
