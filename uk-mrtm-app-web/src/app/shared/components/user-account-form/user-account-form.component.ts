import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TextInputComponent } from '@netz/govuk-components';

import { PhoneInputComponent } from '@shared/components';
import { existingControlContainer } from '@shared/providers/control-container.factory';

@Component({
  selector: 'mrtm-user-account-form',
  imports: [ReactiveFormsModule, TextInputComponent, PhoneInputComponent],
  standalone: true,
  templateUrl: './user-account-form.component.html',
  viewProviders: [existingControlContainer],
})
export class UserAccountFormComponent {
  readonly formMode = input<'CREATE' | 'EDIT'>('CREATE');
  readonly emailHint = input<string>();
  readonly phoneType = input<'full' | 'national'>();
}
