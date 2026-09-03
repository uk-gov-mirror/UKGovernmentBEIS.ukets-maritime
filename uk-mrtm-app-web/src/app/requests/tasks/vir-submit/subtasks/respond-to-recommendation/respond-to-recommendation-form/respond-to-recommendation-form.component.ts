import { NgTemplateOutlet, UpperCasePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { distinctUntilChanged, take } from 'rxjs';

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
import { RESPOND_TO_RECOMMENDATION_SUBTASK, virSubtaskList } from '@requests/common/vir';
import { virCommonQuery } from '@requests/common/vir/+state';
import { VirRespondToRecommendationWizardStep } from '@requests/tasks/vir-submit/subtasks/respond-to-recommendation';
import { respondToRecommendationFormProvider } from '@requests/tasks/vir-submit/subtasks/respond-to-recommendation/respond-to-recommendation-form/respond-to-recommendation-form.provider';
import { VirVerifierRecommendationSummaryTemplateComponent, WizardStepComponent } from '@shared/components';

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
    NgTemplateOutlet,
    UpperCasePipe,
  ],
  standalone: true,
  templateUrl: './respond-to-recommendation-form.component.html',
  providers: [respondToRecommendationFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RespondToRecommendationFormComponent implements AfterViewInit {
  private readonly store = inject(RequestTaskStore);
  private readonly service = inject(TaskService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

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

  private get isAddressedCtrl(): AbstractControl {
    return this.formGroup.get('isAddressed');
  }

  public ngAfterViewInit(): void {
    this.isAddressedCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), distinctUntilChanged())
      .subscribe(() => {
        this.formGroup.get('addressedDescription').setValue(null);
      });
  }

  public onSubmit(): void {
    this.service
      .saveSubtask(
        RESPOND_TO_RECOMMENDATION_SUBTASK,
        VirRespondToRecommendationWizardStep.RESPOND_TO,
        this.activatedRoute,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
