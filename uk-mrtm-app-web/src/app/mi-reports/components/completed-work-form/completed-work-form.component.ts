import { Component, input } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';

import {
  ConditionalContentDirective,
  RadioComponent,
  RadioOptionComponent,
  TextInputComponent,
} from '@netz/govuk-components';

import { DatePickerComponent } from '@shared/components';
import { existingControlContainer } from '@shared/providers';

@Component({
  selector: 'mrtm-completed-work-form',
  imports: [
    ReactiveFormsModule,
    RadioComponent,
    RadioOptionComponent,
    ConditionalContentDirective,
    TextInputComponent,
    DatePickerComponent,
  ],
  standalone: true,
  templateUrl: './completed-work-form.component.html',
  viewProviders: [existingControlContainer],
})
export class CompletedWorkFormComponent {
  readonly formGroup = input<UntypedFormGroup>(new UntypedFormGroup({}));
}
