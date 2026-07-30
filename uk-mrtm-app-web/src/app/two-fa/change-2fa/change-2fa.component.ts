import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { of } from 'rxjs';

import { UsersSecuritySetupService } from '@mrtm/api';

import { AuthStore, selectUser } from '@netz/common/auth';
import { catchBadRequest, ErrorCodes } from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';
import { GovukValidators, PanelComponent, TextInputComponent } from '@netz/govuk-components';

import { PendingRequest } from '@core/interfaces/pending-request.interface';
import { WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-change-2fa',
  imports: [WizardStepComponent, ReactiveFormsModule, TextInputComponent, PanelComponent],
  standalone: true,
  templateUrl: './change-2fa.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Change2faComponent implements PendingRequest {
  readonly pendingRequest = inject(PendingRequestService);
  private readonly router = inject(Router);
  private readonly usersSecuritySetupService = inject(UsersSecuritySetupService);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly authStore = inject(AuthStore);

  is2FaChanged = false;
  userProfile = this.authStore.select(selectUser);
  form = this.fb.group({
    password: [
      null,
      [
        GovukValidators.required('Enter the 6-digit code'),
        GovukValidators.pattern('[0-9]*', 'Digit code must contain numbers only'),
        GovukValidators.minLength(6, 'Digit code must contain exactly 6 characters'),
        GovukValidators.maxLength(6, 'Digit code must contain exactly 6 characters'),
      ],
    ],
  });

  onSubmit(): void {
    this.usersSecuritySetupService
      .requestTwoFactorAuthChange(this.form.value)
      .pipe(
        this.pendingRequest.trackRequest(),
        catchBadRequest(ErrorCodes.OTP1001, () => of('invalid-code')),
      )
      .subscribe((res) => {
        if (res === 'invalid-code') {
          this.router.navigate(['2fa', 'invalid-code']);
        } else {
          this.is2FaChanged = true;
        }
      });
  }
}
