import { AbstractControl, ValidatorFn } from '@angular/forms';

import { isAfter } from 'date-fns';

import { latestTodayAnywhere, toUtcStartOfDay } from '@shared/utils';

export function todayOrPastDateValidator(partialMessage?: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: string } | null => {
    const inputDay = toUtcStartOfDay(control.value);

    if (!inputDay) {
      return null;
    }

    const latestToday = latestTodayAnywhere();
    const displayedDate = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(latestToday);

    return isAfter(inputDay, latestToday)
      ? {
          invalidTodayOrPastDate: partialMessage
            ? `${partialMessage} must be the same as or before ${displayedDate}`
            : `The date must be the same as or before ${displayedDate}`,
        }
      : null;
  };
}
