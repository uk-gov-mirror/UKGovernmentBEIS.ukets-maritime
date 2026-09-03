import { NgTemplateOutlet } from '@angular/common';
import { AfterContentChecked, AfterContentInit, Component, contentChildren, input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { ErrorMessageComponent } from '../error-message';
import { FieldsetDirective, FieldsetHintDirective, LegendDirective, LegendSizeType } from '../fieldset';
import { FormInput } from '../form/form-input';
import { GovukSpacingUnit } from '../types';
import { RadioOptionComponent } from './radio-option/radio-option.component';

/*
  eslint-disable
  @angular-eslint/component-selector
 */
@Component({
  selector: 'div[govuk-radio]',
  imports: [LegendDirective, FieldsetDirective, FieldsetHintDirective, ErrorMessageComponent, NgTemplateOutlet],
  standalone: true,
  templateUrl: './radio.component.html',
})
export class RadioComponent<T>
  extends FormInput
  implements AfterContentInit, AfterContentChecked, ControlValueAccessor
{
  readonly legend = input<string>();
  readonly hint = input<string>();
  readonly radioSize = input<'medium' | 'large'>('large');
  readonly isInline = input(false);
  readonly legendSize = input<LegendSizeType>('normal');
  readonly legendBottomSpacing = input<GovukSpacingUnit>(3);

  readonly options = contentChildren(RadioOptionComponent);

  private onChange: (_: T) => any;
  private onBlur: () => any;
  private isDisabled: boolean;

  constructor() {
    super();
  }

  ngAfterContentInit() {
    this.setDisabledState(this.isDisabled);
    this.writeValue(this.control.value);
  }

  ngAfterContentChecked(): void {
    this.options().forEach((option, index) => {
      option.index = index;
      option.groupIdentifier = this.identifier;
      option.registerOnChange(this.onChange);
    });
    this.registerOnTouched(this.onBlur);
  }

  writeValue(value: T): void {
    this.options()?.forEach((option) => option.writeValue(value));
  }

  registerOnChange(onChange: (_: T) => any): void {
    this.onChange = (option) => {
      this.writeValue(option);
      onChange(option);
    };
    this.options()?.forEach((option) => option.registerOnChange(this.onChange));
  }

  registerOnTouched(onBlur: () => any): void {
    this.onBlur = onBlur;
    this.options()?.forEach((option) => option.registerOnTouched(this.onBlur));
  }

  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
    this.options()?.forEach((option) => option.setDisabledState(isDisabled));
  }
}
