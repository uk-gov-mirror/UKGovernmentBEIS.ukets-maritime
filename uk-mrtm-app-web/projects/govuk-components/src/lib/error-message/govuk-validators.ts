import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

import { MessageValidationErrors, MessageValidatorFn } from './message-validation-errors';

// @dynamic
export class GovukValidators {
  static builder(message: string | MessageValidationErrors, validator: ValidatorFn): MessageValidatorFn {
    return (control: AbstractControl) => {
      const validity = validator(control);

      return validity
        ? Object.keys(validity).reduce(
            (errors, key) => ({ ...errors, [key]: typeof message === 'string' ? message : message[key] }),
            {},
          )
        : null;
    };
  }

  static required(message: string): MessageValidatorFn {
    return GovukValidators.builder(message, Validators.required);
  }

  static requiredTrue(message: string): MessageValidatorFn {
    return GovukValidators.builder(message, Validators.requiredTrue);
  }

  static min(min: number, message: string): MessageValidatorFn {
    return GovukValidators.builder(message, Validators.min(min));
  }

  static max(max: number, message: string): MessageValidatorFn {
    return GovukValidators.builder(message, Validators.max(max));
  }

  static email(message = 'Enter a valid email'): MessageValidatorFn {
    return GovukValidators.builder(message, Validators.email);
  }

  static minLength(length: number, message: string): MessageValidatorFn {
    return GovukValidators.builder(message, Validators.minLength(length));
  }

  static maxLength(length: number, message: string): MessageValidatorFn {
    return GovukValidators.builder(message, Validators.maxLength(length));
  }

  static minMaxRangeNumberValidator(
    min: number,
    max: number,
    message = `Enter a number between ${min} and ${max}`,
  ): MessageValidatorFn {
    return GovukValidators.builder(message, this.rangeNumberValidator(min, max));
  }

  static pattern(pattern: string | RegExp, message: string): MessageValidatorFn {
    return GovukValidators.builder(message, Validators.pattern(pattern));
  }

  static maxFileSize(maxFileSize: number, message: string): MessageValidatorFn {
    return GovukValidators.builder(message, this.maxFileSizeValidator(maxFileSize));
  }

  static fileExtension(accepted: string, message: string): MessageValidatorFn {
    const stringArray = accepted.replace(/\./g, '').split(',');
    return GovukValidators.builder(message, this.fileExtensionValidator(stringArray));
  }

  static notNaN(message: string): MessageValidatorFn {
    return GovukValidators.builder(message, this.notNaNValidator());
  }

  static empty(message: string): MessageValidatorFn {
    return GovukValidators.builder(message, this.emptyValidator());
  }

  static incomplete(message: string): MessageValidatorFn {
    return GovukValidators.builder(message, this.incompleteValidator());
  }

  static positiveNumber(message = 'Must accept only positive values >0'): MessageValidatorFn {
    return GovukValidators.builder(message, this.isPositiveNumber());
  }

  static integerNumber(message = 'Must accept only integer values') {
    return GovukValidators.builder(message, this.isInteger());
  }

  static naturalNumber(message = 'Must accept only positive integer values >0') {
    return GovukValidators.builder(message, this.isNatural());
  }

  static wholeNumber(message = 'Must accept only positive integer values or zero') {
    return GovukValidators.builder(message, this.isWhole());
  }

  static percentageValidator(decimalDigits: number, message = 'Must be less or equal than 100%') {
    const regex = new RegExp(`^-?((100(\\.(0){1,${decimalDigits}})?)?|(\\d{1,2})(\\.\\d{1,${decimalDigits}})?)$`);
    return GovukValidators.pattern(regex, message);
  }

  static maxIntegerAndDecimalsValidator = (integerDigits: number, decimalDigits: number): MessageValidatorFn => {
    const regex = new RegExp(`^-?[0-9]{1,${integerDigits}}(\\.[0-9]{1,${decimalDigits}})?$`, '');
    return GovukValidators.pattern(
      regex,
      `Enter a number up to ${integerDigits} integer and ${decimalDigits} decimal places`,
    );
  };

  static maxDecimalValidator = (integerDigits: number): MessageValidatorFn => {
    const regex = new RegExp(`^-?[0-9]{1,${integerDigits}}(\\.[0-9]+)?$`, '');
    return GovukValidators.pattern(regex, `Enter a number up to ${integerDigits} integer places`);
  };

  static maxIntegersValidator = (maxIntegerDigits: number): MessageValidatorFn => {
    const regex = new RegExp('^[-]?[0-9]{1,12}(\\.[0-9]+)?$');
    return GovukValidators.pattern(regex, `Enter a number up to ${maxIntegerDigits} integer places`);
  };

  static maxDigitsValidator = (maxDigits: number): MessageValidatorFn => {
    const regex = new RegExp(`^[0-9]{1,${maxDigits}}$`);
    return GovukValidators.pattern(regex, `Enter a number up to ${maxDigits} digits`);
  };

  static maxDecimalsValidator = (decimalDigits: number): MessageValidatorFn => {
    return GovukValidators.builder(
      `Enter a number up to ${decimalDigits} decimal places`,
      this.decimalsValidator(decimalDigits),
    );
  };

  static positiveOrZeroNumber(message = 'Must accept only positive numbers or zero'): MessageValidatorFn {
    return GovukValidators.builder(message, this.isPositiveOrZeroNumber());
  }

  private static decimalsValidator(decimalDigits: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const inputNumValue = Number(control.value);

      if (!isNaN(inputNumValue)) {
        const regex = new RegExp(`^-?[0-9]+(\\.[0-9]{1,${decimalDigits}})?$`, '');

        return control.value !== null &&
          control.value !== undefined &&
          control.value !== '' &&
          !regex.test(control.value)
          ? { invalidDecimals: true }
          : null;
      }
      return null;
    };
  }

  private static isPositiveOrZeroNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const inputNumValue = Number(control.value);

      return control.value !== null && control.value !== undefined && inputNumValue < 0
        ? { invalidPositiveOrZero: true }
        : null;
    };
  }

  private static isPositiveNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const inputNumValue = Number(control.value);

      return control.value !== null && control.value !== undefined && inputNumValue <= 0
        ? { invalidPositive: true }
        : null;
    };
  }

  private static isInteger(): ValidatorFn {
    const intRegex = new RegExp('^[0-9]*$');
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value = control.value;
      return control.value !== null && control.value !== undefined && !intRegex.test(value)
        ? { invalidInteger: true }
        : null;
    };
  }

  private static isNatural(): ValidatorFn {
    const intRegex = new RegExp('^[0-9]*$');
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value = control.value;
      return control.value !== null && control.value !== undefined && (!intRegex.test(value) || Number(value) <= 0)
        ? { invalidNatural: true }
        : null;
    };
  }

  private static rangeNumberValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      let error: { [key: string]: boolean } | null = null;
      if (control.value !== null && control.value !== undefined && !isNaN(control.value)) {
        if (control.value < min || control.value > max) {
          error = { invalidLength: true };
        }
      }
      return error;
    };
  }

  private static isWhole(): ValidatorFn {
    const intRegex = new RegExp('^[0-9]*$');
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value = control.value;
      return control.value !== null && control.value !== undefined && (!intRegex.test(value) || Number(value) < 0)
        ? { invalidWhole: true }
        : null;
    };
  }

  private static maxFileSizeValidator(maxFileSize: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (
        control.value &&
        control.value instanceof FileList &&
        Object.values(control.value).some((file) => file.size > maxFileSize)
      ) {
        return { maxFileSize: true };
      }
      return null;
    };
  }

  private static fileExtensionValidator(accepted: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (
        control.value &&
        control.value instanceof FileList &&
        Object.values(control.value).some((file) => accepted.indexOf(file.name.split('.').pop()) === -1)
      ) {
        return { fileExtension: true };
      }
      return null;
    };
  }

  private static notNaNValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value !== '' && isNaN(control.value)) {
        return { isNaN: true };
      }
      return null;
    };
  }

  private static emptyValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (
        control.value === null ||
        control.value === undefined ||
        Object.keys(control.value).length === 0 ||
        Object.keys(control.value).every(
          (key) => control.value[key] === null || control.value[key] === undefined || control.value[key] === '',
        )
      ) {
        return { empty: true };
      }
      return null;
    };
  }

  private static incompleteValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (
        control.value !== null &&
        control.value !== undefined &&
        Object.keys(control.value).length !== 0 &&
        Object.keys(control.value).some(
          (key) => control.value[key] === null || control.value[key] === undefined || control.value[key] === '',
        ) &&
        Object.keys(control.value).some(
          (key) => control.value[key] !== null && control.value[key] !== undefined && control.value[key] !== '',
        )
      ) {
        return { incomplete: true };
      }
      return null;
    };
  }
}
