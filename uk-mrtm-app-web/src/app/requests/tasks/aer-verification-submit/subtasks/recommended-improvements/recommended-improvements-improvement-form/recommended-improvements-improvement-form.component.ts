import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { TextareaComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  RECOMMENDED_IMPROVEMENTS_SUB_TASK,
  recommendedImprovementsMap,
  RecommendedImprovementsStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { recommendedImprovementsImprovementFormProvider } from '@requests/tasks/aer-verification-submit/subtasks/recommended-improvements/recommended-improvements-improvement-form/recommended-improvements-improvement-form.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-recommended-improvements-improvement-form',
  imports: [ReactiveFormsModule, TextareaComponent, WizardStepComponent],
  standalone: true,
  templateUrl: './recommended-improvements-improvement-form.component.html',
  providers: [recommendedImprovementsImprovementFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendedImprovementsImprovementFormComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = recommendedImprovementsMap;
  readonly isEditMode = !!this.formGroup.get('reference')?.value;

  onSubmit() {
    this.service
      .saveSubtask(
        RECOMMENDED_IMPROVEMENTS_SUB_TASK,
        this.isEditMode ? RecommendedImprovementsStep.ITEM_FORM_EDIT : RecommendedImprovementsStep.ITEM_FORM_ADD,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
