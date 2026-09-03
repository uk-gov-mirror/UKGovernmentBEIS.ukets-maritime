import { isAfter, isBefore, isSameDay } from 'date-fns';

export const dateFormatPattern = /(\d{1,2})([-/,. ])(\d{1,2})\2(\d{4})/;

export const timeFormatPattern = /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;

export const mergeDatesToString = (dateDate: Date, timeDate: Date): string => {
  return mergeDatesToDate(dateDate, timeDate).toISOString();
};

export const mergeDatesToDate = (dateDate?: Date, timeDate?: Date): Date | null => {
  if (dateDate instanceof Date && timeDate instanceof Date) {
    return new Date(
      Date.UTC(
        dateDate.getUTCFullYear(),
        dateDate.getUTCMonth(),
        dateDate.getUTCDate(),
        timeDate.getUTCHours(),
        timeDate.getUTCMinutes(),
        timeDate.getUTCSeconds(),
      ),
    );
  }

  return null;
};

/**
 * UTC+14 (Line Islands, Kiribati) - the furthest ahead of UTC any civil timezone runs.
 * The API tolerates 14 hours either side when it validates a date against "today", so neither bound
 * below is ever wider than what the API accepts.
 */
const MAX_OFFSET_EAST_MS = 14 * 60 * 60 * 1000;

/** UTC-12 (Baker and Howland Islands) - the furthest behind UTC any civil timezone runs. */
const MAX_OFFSET_WEST_MS = 12 * 60 * 60 * 1000;

/**
 * Normalises a form control value to UTC midnight so it can be compared with the "today" bounds below.
 * Accepts the UTC midnight `Date` produced by the date input components, an ISO string or a "yyyy-MM-dd" string.
 * @returns the UTC start of the day, or null when the value is empty or unparseable.
 */
export const toUtcStartOfDay = (value: Date | string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) {
    return null;
  }

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

/**
 * The latest calendar day that is currently "today" for anyone on Earth, expressed as a UTC date.
 * Date validations use this as the upper bound so a user ahead of UTC is not blocked from entering
 * their own local today, which the API accepts thanks to its own tolerance.
 */
export const latestTodayAnywhere = (): Date => toUtcStartOfDay(new Date(Date.now() + MAX_OFFSET_EAST_MS));

/**
 * The earliest calendar day that is currently "today" for anyone on Earth, expressed as a UTC date.
 * The mirror image of {@link latestTodayAnywhere} for validations that look forward, so a user behind
 * UTC is not blocked from entering their own local today.
 */
export const earliestTodayAnywhere = (): Date => toUtcStartOfDay(new Date(Date.now() - MAX_OFFSET_WEST_MS));

export const convertToUTCDate = (date: Date): Date | null => {
  if (date instanceof Date) {
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    );
  }

  return null;
};

/**
 * Parses a date string and returns a Date object. Accepts formats "d/M/yyyy" and "dd/MM/yyyy".
 * @param dateString - The date string in format "d/M/yyyy" or "dd/MM/yyyy".
 * @param fallback - A fallback Date object to be returned if the parsing fails.
 * @param isUTC - Determines if the resulting `Date` should be in UTC format.
 */
export const formatDateFromString = (dateString: string, fallback = new Date(), isUTC = false): Date | null => {
  let formattedDate = null;

  if (!dateFormatPattern.test(dateString)) return fallback;

  const match = dateString.match(dateFormatPattern);
  const day = Number(match[1]);
  const month = Number(match[3]);
  const year = Number(match[4]);
  formattedDate = isUTC ? new Date(Date.UTC(year, month - 1, day)) : new Date(year, month - 1, day);
  if (formattedDate instanceof Date && !isNaN(formattedDate as any)) {
    return formattedDate;
  }

  return fallback;
};

export const formatDateTimeFromString = (dateString: string, timeString: string, isUTC = false): Date | null => {
  let formattedDate = null;
  if (!dateFormatPattern.test(dateString) || !timeFormatPattern.test(timeString)) return null;

  const dateMatch = dateString.match(dateFormatPattern);
  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[3]);
  const year = Number(dateMatch[4]);
  const timeMatch = timeString.match(timeFormatPattern);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const seconds = Number(timeMatch[3]);

  formattedDate = isUTC
    ? new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, 0))
    : new Date(year, month - 1, day, hours, minutes, seconds);
  if (formattedDate instanceof Date && !isNaN(formattedDate as any)) {
    return formattedDate;
  }

  return null;
};

export const isSameDayOrBefore = (shouldBeSameOrBeforeDate: Date, comparisonDate: Date): boolean => {
  return isBefore(shouldBeSameOrBeforeDate, comparisonDate) || isSameDay(shouldBeSameOrBeforeDate, comparisonDate);
};

export const isSameDayOrAfter = (shouldBeSameOrAfterDate: Date, comparisonDate: Date): boolean => {
  return isAfter(shouldBeSameOrAfterDate, comparisonDate) || isSameDay(shouldBeSameOrAfterDate, comparisonDate);
};
