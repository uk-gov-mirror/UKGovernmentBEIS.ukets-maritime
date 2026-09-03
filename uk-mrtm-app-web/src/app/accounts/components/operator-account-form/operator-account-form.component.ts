import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { DateInputComponent, TextareaComponent, TextInputComponent } from '@netz/govuk-components';

import { LocationStateFormComponent } from '@shared/components';
import { existingControlContainer } from '@shared/providers/control-container.factory';

@Component({
  selector: 'mrtm-operator-account-form',
  imports: [LocationStateFormComponent, ReactiveFormsModule, TextInputComponent, DateInputComponent, TextareaComponent],
  standalone: true,
  templateUrl: './operator-account-form.component.html',
  viewProviders: [existingControlContainer],
})
export class OperatorAccountFormComponent {
  readonly formMode = input<'EDIT' | 'NEW'>('NEW');
}
