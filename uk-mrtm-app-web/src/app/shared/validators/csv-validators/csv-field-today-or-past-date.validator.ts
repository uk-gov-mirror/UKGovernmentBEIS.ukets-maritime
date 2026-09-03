import { FormControl, ValidatorFn } from '@angular/forms';

import { isAfter } from 'date-fns';

import { formatDateFromString, latestTodayAnywhere } from '@shared/utils';

/**
 * Validates a CSV field of type date according to DD/MM/YYYY format and whether is today or past date
 * Returns the column and row the error was found at
 */
export function csvFieldTodayOrPastDateValidator<T>(
  field: keyof T,
  csvMap: Record<keyof T, string>,
  message: string,
  hiddenIfNull = true,
): ValidatorFn {
  return (control: FormControl): { [key: string]: any } | null => {
    const data = control.value;

    if (!Array.isArray(data)) {
      return null;
    }

    const errorMessageRows = [];

    data.forEach((dataRow, index) => {
      const currentField = formatDateFromString(dataRow[field], null, true);

      if (hiddenIfNull && (currentField === null || currentField === undefined)) {
        return null;
      }

      if (isAfter(currentField, latestTodayAnywhere())) {
        errorMessageRows.push({
          rowIndex: index + 2,
        });
      }
    });

    if (errorMessageRows.length > 0) {
      return {
        ['csvFieldTodayOrPastDate' + field.toString()]: {
          rows: errorMessageRows,
          columns: [csvMap?.[field]],
          message: message,
        },
      };
    }

    return null;
  };
}
