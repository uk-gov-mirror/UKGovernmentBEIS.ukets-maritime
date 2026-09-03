import { Component, DoCheck, effect, inject, input, InputSignal, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';

import {
  ErrorMessageComponent,
  FieldsetDirective,
  FieldsetHintDirective,
  FormInput,
  GovukValidators,
  LegendDirective,
  LegendSizeType,
} from '@netz/govuk-components';

import { timeInputFormProvider } from '@shared/components/time-input/time-input.form-provider';
import { buildDateTime, getCombinedTimeValidationResults } from '@shared/components/time-input/time-input.helpers';
import {
  TIME_INPUT_FORM,
  TimeInputFormGroupModel,
  TimeInputFormModel,
} from '@shared/components/time-input/time-input.types';
import { isNil } from '@shared/utils';

@Component({
  selector: 'div[mrtm-time-input]',
  imports: [ErrorMessageComponent, ReactiveFormsModule, FieldsetHintDirective, LegendDirective, FieldsetDirective],
  standalone: true,
  templateUrl: './time-input.component.html',
  providers: [timeInputFormProvider],
})
export class TimeInputComponent extends FormInput implements ControlValueAccessor, OnInit, DoCheck {
  public readonly formGroup: FormGroup<TimeInputFormGroupModel> = inject(TIME_INPUT_FORM);
  private onChange: (value: Partial<TimeInputFormModel>) => void;
  private onBlur: () => any;
  private initialValidator: ValidatorFn;
  private readonly currentFormValue = toSignal(this.formGroup.valueChanges);
  public readonly label: InputSignal<string> = input<string>();
  public readonly legendSize: InputSignal<LegendSizeType> = input<LegendSizeType>();
  public readonly hint: InputSignal<string> = input<string>();
  public readonly isRequired: InputSignal<boolean> = input<boolean>();

  constructor() {
    super();

    effect(() => {
      const value = this.currentFormValue();
      if (isNil(this.onChange)) {
        return;
      }

      this.onChange(value);
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.initialValidator = this.control.validator;
    this.control.setValidators([this.validate.bind(this)]);
    this.control.updateValueAndValidity();
  }

  public ngDoCheck(): void {
    if (!this.control.touched) {
      this.formGroup.markAsTouched();
    }
  }

  public writeValue(value: Date | null): void {
    if (value) {
      this.formGroup.setValue({
        day: value.getUTCDate(),
        month: value.getUTCMonth() + 1,
        year: value.getUTCFullYear(),
        hours: value.getUTCHours(),
        minutes: value.getUTCMinutes(),
        seconds: value.getUTCSeconds(),
      });
    }
  }

  public setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.formGroup.disable();
    } else {
      this.formGroup.enable();
    }
  }

  public hasFieldError(identifier: string): boolean {
    if (this.shouldDisplayErrors) {
      const fieldControl = this.formGroup.get(identifier);

      return fieldControl.invalid || (!fieldControl.value && this.control.errors?.incomplete);
    } else {
      return false;
    }
  }

  public onInputBlur(): void {
    if (Object.values(this.formGroup.controls).every((control) => control.touched)) {
      this.onBlur();
    }
  }

  public registerOnChange(onChange: (_: Date) => void): void {
    this.onChange = (values) => onChange(this.formGroup.invalid ? null : buildDateTime(values as TimeInputFormModel));
  }

  public registerOnTouched(onBlur: () => any): void {
    this.onBlur = onBlur;
  }

  private validate(): ValidationErrors {
    return {
      ...this.formGroup.get('hours').errors,
      ...this.formGroup.get('minutes').errors,
      ...this.formGroup.get('seconds').errors,
      ...this.validateControl(),
    };
  }

  private timeRulesValidator(): ValidationErrors {
    const validationResults: ValidationErrors = getCombinedTimeValidationResults(this.formGroup, this.isRequired());
    const errorMessage = validationResults?.isEmpty
      ? 'Enter time'
      : validationResults?.isIncomplete
        ? 'The format should be “HH:MM:SS”'
        : validationResults?.isUnrealTime
          ? 'Entered time must be a real time'
          : '';

    return {
      ...GovukValidators.builder(errorMessage, (fb: FormGroup) =>
        getCombinedTimeValidationResults(fb, this.isRequired()),
      )(this.formGroup),
    };
  }

  private validateControl(): ValidationErrors {
    return {
      ...(this.initialValidator ? this.initialValidator(this.control) : null),
      ...this.timeRulesValidator(),
    };
  }
}
