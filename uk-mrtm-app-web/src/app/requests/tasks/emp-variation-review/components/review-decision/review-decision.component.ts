import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { RequestTaskStore } from '@netz/common/store';
import {
  ButtonDirective,
  ConditionalContentDirective,
  FieldsetDirective,
  LegendDirective,
  RadioComponent,
  RadioOptionComponent,
  TextareaComponent,
} from '@netz/govuk-components';

import { empCommonQuery } from '@requests/common/emp/+state';
import { VARIATION_REVIEW_DECISION_FORM } from '@requests/tasks/emp-variation-review/components/review-decision/review-decision-form.token';
import { ReviewDecisionFormModel } from '@requests/tasks/emp-variation-review/components/review-decision/review-decision-form-model.type';
import {
  createAnotherRequiredChange,
  createAnotherVariationSchedule,
} from '@requests/tasks/emp-variation-review/components/review-decision/review-emp-subtask-decision-form.provider';
import { MultipleFileInputComponent } from '@shared/components';
import { existingControlContainer } from '@shared/providers';
import { RequestTaskFileService } from '@shared/services';

@Component({
  selector: 'mrtm-review-decision',
  imports: [
    ButtonDirective,
    ReactiveFormsModule,
    RadioComponent,
    RadioOptionComponent,
    TextareaComponent,
    MultipleFileInputComponent,
    LegendDirective,
    FieldsetDirective,
    ConditionalContentDirective,
  ],
  standalone: true,
  templateUrl: './review-decision.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [existingControlContainer],
})
export class ReviewDecisionComponent {
  protected readonly form: ReviewDecisionFormModel = inject(VARIATION_REVIEW_DECISION_FORM);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly requestTaskFileService: RequestTaskFileService = inject(RequestTaskFileService);
  downloadUrl = this.store.select(empCommonQuery.selectTasksDownloadUrl)();

  get requiredChangesCtrl() {
    return this.form.controls.requiredChanges;
  }

  get variationScheduleItemsCtrl() {
    return this.form.controls.variationScheduleItems;
  }

  addOtherRequiredChange(): void {
    this.requiredChangesCtrl.push(createAnotherRequiredChange(this.store, this.requestTaskFileService));
  }

  addAnotherVariationSchedule(): void {
    this.variationScheduleItemsCtrl.push(createAnotherVariationSchedule());
  }
}
