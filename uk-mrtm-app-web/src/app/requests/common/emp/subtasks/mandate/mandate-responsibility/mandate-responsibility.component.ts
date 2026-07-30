import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import {
  ButtonDirective,
  ConditionalContentDirective,
  LinkDirective,
  RadioComponent,
  RadioOptionComponent,
  WarningTextComponent,
} from '@netz/govuk-components';

import { empCommonQuery } from '@requests/common/emp/+state';
import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { MANDATE_SUB_TASK, MandateWizardStep } from '@requests/common/emp/subtasks/mandate';
import { mandateResponsibilityFormProvider } from '@requests/common/emp/subtasks/mandate/mandate-responsibility/mandate-responsibility.form-provider';
import { MandateResponsibilityFormGroupModel } from '@requests/common/emp/subtasks/mandate/mandate-responsibility/mandate-responsibility.types';
import { mandateMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { TASK_FORM } from '@requests/common/task-form.token';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-mandate-responsibility',
  imports: [
    WizardStepComponent,
    ReactiveFormsModule,
    RadioComponent,
    RadioOptionComponent,
    ConditionalContentDirective,
    WarningTextComponent,
    RouterLink,
    LinkDirective,
    ButtonDirective,
  ],
  standalone: true,
  templateUrl: './mandate-responsibility.component.html',
  providers: [mandateResponsibilityFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MandateResponsibilityComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly service: TaskService<EmpTaskPayload> = inject(TaskService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  public readonly form: FormGroup<MandateResponsibilityFormGroupModel> = inject(TASK_FORM);
  public readonly wizardMap = mandateMap;

  public readonly showDeleteQuestion: WritableSignal<boolean> = signal<boolean>(false);
  public readonly hasAlreadyRegisteredOwners: Signal<boolean> = computed(
    () => this.store.select(empCommonQuery.selectMandateRegisteredOwners)()?.length > 0,
  );

  public onSubmit(force: boolean = false): void {
    if (!this.form.value.exist && !force && this.hasAlreadyRegisteredOwners()) {
      this.showDeleteQuestion.set(true);
      return;
    }

    this.service
      .saveSubtask(MANDATE_SUB_TASK, MandateWizardStep.RESPONSIBILITY, this.activatedRoute, this.form.value)
      .pipe(take(1))
      .subscribe();
  }
}
