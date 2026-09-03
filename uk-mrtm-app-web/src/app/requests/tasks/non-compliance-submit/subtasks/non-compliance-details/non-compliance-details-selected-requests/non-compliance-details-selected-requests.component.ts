import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, GovukSelectOption, SelectComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import {
  NON_COMPLIANCE_DETAILS_SUB_TASK,
  nonComplianceDetailsMap,
  NonComplianceDetailsStep,
  NonComplianceSubmitTaskPayload,
} from '@requests/common/non-compliance';
import { nonComplianceSubmitQuery } from '@requests/tasks/non-compliance-submit/+state';
import { nonComplianceDetailsSelectedRequestsProvider } from '@requests/tasks/non-compliance-submit/subtasks/non-compliance-details/non-compliance-details-selected-requests/non-compliance-details-selected-requests.form-provider';
import { WizardStepComponent } from '@shared/components';
import { RequestNamePipe } from '@shared/pipes';

@Component({
  selector: 'mrtm-non-compliance-details-selected-requests',
  imports: [ButtonDirective, SelectComponent, ReactiveFormsModule, WizardStepComponent],
  standalone: true,
  templateUrl: './non-compliance-details-selected-requests.component.html',
  providers: [nonComplianceDetailsSelectedRequestsProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonComplianceDetailsSelectedRequestsComponent {
  readonly formGroup = inject<FormGroup>(TASK_FORM);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TaskService<NonComplianceSubmitTaskPayload>);
  private readonly store = inject(RequestTaskStore);
  readonly map = nonComplianceDetailsMap;
  private readonly nonComplianceDetails = this.store.select(nonComplianceSubmitQuery.selectNonComplianceDetails);
  private readonly requestNamePipe = new RequestNamePipe();

  get selectedRequestsFormArray(): FormArray<FormControl<string>> {
    return this.formGroup.get('selectedRequests') as FormArray<FormControl<string>>;
  }

  readonly selectedRequests: Signal<string[]> = toSignal(this.selectedRequestsFormArray.valueChanges, {
    initialValue: this.selectedRequestsFormArray.value,
  });
  readonly availableRequestsOptions = computed<Array<GovukSelectOption[]>>(() =>
    this.selectedRequests().map((selectedRequestId) =>
      [...(this.nonComplianceDetails()?.availableRequests ?? [])]
        .sort((a, b) => (a.id > b.id ? 1 : -1))
        .filter(({ id }) => id === selectedRequestId || !this.selectedRequests().includes(id))
        .map(({ id, type }) => ({ value: id, text: this.requestNamePipe.transform({ id, type }) })),
    ),
  );
  readonly showAddButton = computed<boolean>(
    () => this.nonComplianceDetails()?.availableRequests?.length > this.selectedRequests().length,
  );

  onAdd() {
    this.selectedRequestsFormArray.push(new FormControl<string>(null));
  }

  onRemove(index: number) {
    this.selectedRequestsFormArray.removeAt(index);
  }

  onSubmit() {
    this.service
      .saveSubtask(
        NON_COMPLIANCE_DETAILS_SUB_TASK,
        NonComplianceDetailsStep.SELECTED_REQUESTS,
        this.route,
        this.formGroup.value,
      )
      .pipe(take(1))
      .subscribe();
  }
}
