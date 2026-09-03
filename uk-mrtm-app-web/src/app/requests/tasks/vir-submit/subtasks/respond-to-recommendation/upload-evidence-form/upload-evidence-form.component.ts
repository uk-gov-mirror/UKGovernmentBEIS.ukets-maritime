import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { TASK_FORM } from '@requests/common';
import { RESPOND_TO_RECOMMENDATION_SUBTASK, virSubtaskList } from '@requests/common/vir';
import { virCommonQuery } from '@requests/common/vir/+state';
import { VirRespondToRecommendationWizardStep } from '@requests/tasks/vir-submit/subtasks/respond-to-recommendation';
import { uploadEvidenceFormProvider } from '@requests/tasks/vir-submit/subtasks/respond-to-recommendation/upload-evidence-form/upload-evidence-form.provider';
import { MultipleFileInputComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-upload-evidence-form',
  imports: [WizardStepComponent, MultipleFileInputComponent, ReactiveFormsModule],
  standalone: true,
  templateUrl: './upload-evidence-form.component.html',
  providers: [uploadEvidenceFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadEvidenceFormComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly service = inject(TaskService);
  private readonly activatedRoute = inject(ActivatedRoute);

  public readonly formGroup = inject(TASK_FORM);
  public readonly downloadUrl = this.store.select(requestTaskQuery.selectTasksDownloadUrl)();
  public readonly key = input<string>();

  public readonly caption = computed(() => {
    const { verificationDataKey, reference } =
      this.store.select(virCommonQuery.selectVirVerifierRecommendationDataByKey(this.key()))() ?? {};

    return `${reference}: ${virSubtaskList[verificationDataKey]?.title}`;
  });

  public onSubmit(): void {
    this.service
      .saveSubtask(
        RESPOND_TO_RECOMMENDATION_SUBTASK,
        VirRespondToRecommendationWizardStep.UPLOAD_EVIDENCE_FORM,
        this.activatedRoute,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
