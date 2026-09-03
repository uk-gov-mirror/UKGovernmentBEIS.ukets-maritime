import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RadioComponent, RadioOptionComponent, WarningTextComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  RECOMMENDED_IMPROVEMENTS_SUB_TASK,
  recommendedImprovementsMap,
  RecommendedImprovementsStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { recommendedImprovementsExistProvider } from '@requests/tasks/aer-verification-submit/subtasks/recommended-improvements/recommended-improvements-exist/recommended-improvements-exist.form-provider';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-recommended-improvements-exist',
  imports: [RadioComponent, RadioOptionComponent, ReactiveFormsModule, WizardStepComponent, WarningTextComponent],
  standalone: true,
  templateUrl: './recommended-improvements-exist.component.html',
  providers: [recommendedImprovementsExistProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendedImprovementsExistComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  readonly map = recommendedImprovementsMap;

  onSubmit() {
    this.service
      .saveSubtask(
        RECOMMENDED_IMPROVEMENTS_SUB_TASK,
        RecommendedImprovementsStep.EXIST_FORM,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
