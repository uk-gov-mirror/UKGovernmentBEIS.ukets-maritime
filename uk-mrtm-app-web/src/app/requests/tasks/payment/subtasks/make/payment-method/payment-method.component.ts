import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { RadioComponent, RadioOptionComponent } from '@netz/govuk-components';

import { TASK_FORM } from '@requests/common';
import { paymentQuery } from '@requests/tasks/payment/+state';
import { PaymentTaskPayload } from '@requests/tasks/payment/payment.types';
import {
  MAKE_PAYMENT_SUBTASK,
  MakePaymentWizardSteps,
} from '@requests/tasks/payment/subtasks/make/make-payment.constants';
import { paymentMethodFormProvider } from '@requests/tasks/payment/subtasks/make/payment-method/payment-method.form-provider';
import { WizardStepComponent } from '@shared/components';
import { PAYMENT_METHOD_SELECT_OPTIONS } from '@shared/constants';

@Component({
  selector: 'mrtm-payment-method',
  imports: [WizardStepComponent, ReactiveFormsModule, RadioComponent, RadioOptionComponent],
  standalone: true,
  templateUrl: './payment-method.component.html',
  providers: [paymentMethodFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly taskService = inject(TaskService<PaymentTaskPayload>);
  private readonly activatedRoute = inject(ActivatedRoute);
  public readonly form: FormGroup = inject(TASK_FORM);

  public readonly options = computed(() => {
    const availablePaymentMethods = this.store.select(paymentQuery.selectAvailablePaymentMethods)();

    return PAYMENT_METHOD_SELECT_OPTIONS.filter((option) => availablePaymentMethods.includes(option.value));
  });

  public onSubmit(): void {
    this.taskService
      .saveSubtask(MAKE_PAYMENT_SUBTASK, MakePaymentWizardSteps.PAYMENT_METHOD, this.activatedRoute, this.form.value)
      .pipe(take(1))
      .subscribe();
  }
}
