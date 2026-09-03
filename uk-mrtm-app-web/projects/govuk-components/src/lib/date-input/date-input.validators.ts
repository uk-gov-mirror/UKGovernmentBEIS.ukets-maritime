import { AbstractControl, UntypedFormGroup, ValidatorFn } from '@angular/forms';

interface DateInputParts {
  year?: string | number;
  month?: string | number;
  day?: string | number;
}

// @dynamic
export class DateInputValidators {
  static dateFieldValidator(identifier: string, min: number, max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null =>
      control.value && (control.value < min || control.value > max) ? { [identifier]: true } : null;
  }

  static minMaxDateValidator(min: Date, max: Date): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null =>
      control.value && min && control.value < min
        ? { minDate: true }
        : control.value && max && control.value > max
          ? { maxDate: true }
          : null;
  }

  static dateIncompleteValidator: ValidatorFn = (fg: AbstractControl) => {
    const day = fg.get('day').value;
    const month = fg.get('month').value;
    const year = fg.get('year').value;
    return (day || month || year) && (!year || !month || !day) ? { incomplete: true } : null;
  };

  static incorrectDayValidator: ValidatorFn = (fg: AbstractControl) => {
    const day = fg.get('day').value;
    const month = fg.get('month').value;

    return (Number(day) > 29 && Number(month) === 2) ||
      (DateInputValidators.isShortMonth(Number(month)) && Number(day) > 30) ||
      Number(day) > 31
      ? { day: true }
      : null;
  };

  static isLeapYear(year: number): boolean {
    return !(year & 3 || (!(year % 25) && year & 15));
  }

  static isShortMonth(month: number): boolean {
    return month === 2 || month === 4 || month === 6 || month === 9 || month === 11;
  }

  static buildDate({ year, month, day }: DateInputParts): Date | null {
    return !year || !month || !day ? null : new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  static combinedRulesValidator = (fg: UntypedFormGroup, isRequired = false): ValidatorFn => {
    return (control: AbstractControl) => {
      return this.getCombinedValidationResults(control, isRequired);
    };
  };

  static getCombinedValidationResults(fg: AbstractControl, isRequired: boolean) {
    return isRequired && this.isEmpty(fg)
      ? { isEmpty: true }
      : this.isIncomplete(fg)
        ? { isIncomplete: true }
        : this.isUnrealDate(fg) && !this.isEmpty(fg)
          ? { isUnrealDate: true }
          : null;
  }

  static isEmpty(fg: AbstractControl): boolean {
    const day = fg.get('day').value;
    const month = fg.get('month').value;
    const year = fg.get('year').value;
    return !day && !month && !year;
  }

  static isIncomplete(fg: AbstractControl): boolean {
    const day = fg.get('day').value;
    const month = fg.get('month').value;
    const year = fg.get('year').value;
    return (day || month || year) && (!year || !month || !day);
  }

  static isUnrealDate(fg: AbstractControl): boolean {
    const day = fg.get('day').value;
    const month = fg.get('month').value;
    const year = fg.get('year').value;

    const isBetweenTheAllowedValues = (value: unknown, min: number, max: number) => {
      return /^\d+$/.test(String(value)) && Number(value) >= min && Number(value) <= max;
    };
    const isNotCorrectLeapYearDate = () => {
      return Number(day) === 29 && Number(month) === 2 && !DateInputValidators.isLeapYear(Number(year));
    };

    const isIncorrectDay =
      (Number(day) > 29 && Number(month) === 2) ||
      (DateInputValidators.isShortMonth(Number(month)) && Number(day) > 30) ||
      Number(day) > 31;

    return (
      !isBetweenTheAllowedValues(day, 1, 31) ||
      !isBetweenTheAllowedValues(month, 1, 12) ||
      !isBetweenTheAllowedValues(year, 1900, 2100) ||
      isNotCorrectLeapYearDate() ||
      isIncorrectDay
    );
  }
}
