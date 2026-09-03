import { AbstractControl, ValidatorFn } from '@angular/forms';

import { isBefore } from 'date-fns';

import { earliestTodayAnywhere, toUtcStartOfDay } from '@shared/utils';

export const todayOrFutureDateValidator = (partialMessage?: string): ValidatorFn => {
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

    return isBefore(inputDay, earliestToday)
      ? {
          invalidTodayOrFutureDate: partialMessage
            ? `${partialMessage} must be the same as or after ${displayedDate}`
            : `The date must be the same as or after ${displayedDate}`,
        }
      : null;
  };
};
