import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import {
  UNCORRECTED_MISSTATEMENTS_SUB_TASK,
  uncorrectedMisstatementsMap,
  UncorrectedMisstatementsStep,
} from '@requests/common/aer';
import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { aerVerificationSubmitQuery } from '@requests/tasks/aer-verification-submit/+state/aer-verification-submit.selectors';
import { UncorrectedItemsListTemplateComponent } from '@shared/components/summaries';

@Component({
  selector: 'mrtm-uncorrected-misstatements-list',
  imports: [
    RouterLink,
    ButtonDirective,
    PendingButtonDirective,
    PageHeadingComponent,
    ReturnToTaskOrActionPageComponent,
    UncorrectedItemsListTemplateComponent,
  ],
  standalone: true,
  templateUrl: './uncorrected-misstatements-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UncorrectedMisstatementsListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerVerificationSubmitTaskPayload>);
  private readonly store = inject(RequestTaskStore);
  readonly map = uncorrectedMisstatementsMap;
  readonly wizardStep = UncorrectedMisstatementsStep;
  private readonly subtask = UNCORRECTED_MISSTATEMENTS_SUB_TASK;

  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable);
  readonly issues = computed(
    () => this.store.select(aerVerificationSubmitQuery.selectUncorrectedMisstatements)()?.uncorrectedMisstatements,
  );

  onSubmit() {
    this.service.saveSubtask(this.subtask, UncorrectedMisstatementsStep.ITEMS_LIST, this.route, null).subscribe();
  }
}
