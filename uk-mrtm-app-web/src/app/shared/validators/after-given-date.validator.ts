import { AbstractControl, ValidatorFn } from '@angular/forms';

import { isAfter } from 'date-fns';

import { toUtcStartOfDay } from '@shared/utils';

export const afterGivenDateValidator = (
  givenDate: Date,
  targetDateTitle: string,
  comparisonDateTitle: string,
): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: string } | null => {
    const inputDay = toUtcStartOfDay(control.value);
    const givenDay = toUtcStartOfDay(givenDate);

    if (!inputDay || !givenDay) {
      return null;
    }

    return isAfter(inputDay, givenDay)
      ? null
      : { invalidDate: `The ${targetDateTitle} must be after the ${comparisonDateTitle}` };
  };
};
