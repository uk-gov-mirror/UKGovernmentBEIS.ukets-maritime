import { Component, inject, input } from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';

import { FormService } from '@netz/govuk-components';

/* eslint-disable
   @angular-eslint/prefer-on-push-component-change-detection,
   @typescript-eslint/no-unused-vars
*/
@Component({
  selector: 'div[mrtm-radio-option]',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './radio-option.component.html',
  host: { '[class.govuk-radios__item]': 'govukRadiosItem' },
})
export class RadioOptionComponent implements ControlValueAccessor {
  readonly ngControl = inject(NgControl, { self: true, optional: true })!;
  private readonly formService = inject(FormService);

  readonly index = input<string>();
  readonly value = input<string>();
  readonly label = input<string>();
  readonly isDisabled = input<boolean>();

  readonly govukRadiosItem = true;

  constructor() {
    const ngControl = this.ngControl;

    ngControl.valueAccessor = this;
  }

  get identifier(): string {
    return this.formService.getControlIdentifier(this.ngControl);
  }

  get control(): UntypedFormControl {
    return this.ngControl.control as UntypedFormControl;
  }

  writeValue = (_: any): void => {};

  registerOnChange = (_: any): void => {};

  registerOnTouched = (_: any): void => {};
}
