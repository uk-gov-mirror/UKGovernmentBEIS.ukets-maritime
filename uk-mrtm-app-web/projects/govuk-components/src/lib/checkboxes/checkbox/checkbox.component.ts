import { ChangeDetectionStrategy, Component, contentChild, input, signal, TemplateRef, viewChild } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { ConditionalContentDirective } from '../../directives';

@Component({
  selector: 'govuk-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent<T> implements ControlValueAccessor {
  readonly value = input<T>();
  readonly label = input<string>();
  readonly hint = input<string>();
  readonly divider = input<string | null>(null);

  readonly conditional = contentChild(ConditionalContentDirective);
  readonly conditionalTemplate = viewChild<TemplateRef<any>>('conditionalTemplate');
  readonly optionTemplate = viewChild<TemplateRef<any>>('checkboxTemplate');

  readonly isChecked = signal(false);
  readonly isDisabled = signal(false);
  readonly isTouched = signal(false);

  onBlur: () => any;
  onChange: (event: Event) => any;
  index: number;
  groupIdentifier: string;

  get identifier(): string {
    return `${this.groupIdentifier}-${this.index}`;
  }

  registerOnChange(onChange: () => any): void {
    this.onChange = (event) => {
      this.writeValue((event.target as HTMLInputElement).checked);
      onChange();
    };
  }

  registerOnTouched(onBlur: () => any): void {
    this.onBlur = () => {
      this.isTouched.set(true);
      onBlur();
    };
  }

  writeValue(value: boolean): void {
    this.isChecked.set(value);
    this.updateConditionalState();
  }

  setDisabledState(isDisabled: boolean) {
    this.isDisabled.set(isDisabled);
    this.updateConditionalState();
  }

  private updateConditionalState() {
    if (this.isChecked() && !this.isDisabled()) {
      this.conditional()?.enableControls();
    } else {
      this.conditional()?.disableControls();
    }
  }
}
