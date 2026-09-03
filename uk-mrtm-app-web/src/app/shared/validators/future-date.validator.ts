import { AbstractControl, ValidatorFn } from '@angular/forms';

import { isAfter } from 'date-fns';

import { earliestTodayAnywhere, toUtcStartOfDay } from '@shared/utils';

export const futureDateValidator = (partialMessage?: string): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: string } | null => {
    const inputDay = toUtcStartOfDay(control.value);

    if (!inputDay) {
      return null;
    }

    const earliestToday = earliestTodayAnywhere();
    const displayedDate = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(earliestToday);

    return isAfter(inputDay, earliestToday)
      ? null
      : {
          invalidFutureDate: partialMessage
            ? `${partialMessage} must be after ${displayedDate}`
            : `The date must be after ${displayedDate}`,
        };
  };
};
