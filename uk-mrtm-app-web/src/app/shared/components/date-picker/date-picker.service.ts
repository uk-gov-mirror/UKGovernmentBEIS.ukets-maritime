import { ElementRef, Injectable, signal, WritableSignal } from '@angular/core';

import {
  CalendarDate,
  DatePickerConfig,
  dayLabels,
  DayOfWeek,
  monthLabels,
} from '@shared/components/date-picker/date-picker.interface';
import { formatDateFromString } from '@shared/utils';

/**
 * Datepicker service migrated to Angular based on MOJ Datepicker component
 * @see https://github.com/ministryofjustice/moj-frontend/blob/main/src/moj/components/date-picker/date-picker.js
 */
@Injectable()
export class DatePickerService {
  readonly dialogTitle: WritableSignal<string> = signal('');
  readonly isDialogOpen: WritableSignal<boolean> = signal(false);
  readonly calendarDates: WritableSignal<CalendarDate[]> = signal([]);
  readonly inputDate: WritableSignal<Date | null> = signal(null);
  readonly dayLabels: WritableSignal<DayOfWeek[]> = signal(dayLabels);
  readonly excludedDates: WritableSignal<Date[] | null> = signal(null);
  readonly excludedDays: WritableSignal<number[] | null> = signal(null);

  private config!: DatePickerConfig;
  private elementRef: ElementRef;
  private currentDate!: Date;
  private minDate?: Date;
  private maxDate?: Date;

  /**
   * Function that starts all the initialization for the DatePickerService
   * This functions SHOULD ALWAYS be called FIRST
   * @param config - DatePickerConfig based on which all the private members will be set
   * @param elementRef - ElementRef of the DatePicker component container
   */
  init(config: DatePickerConfig, elementRef: ElementRef) {
    this.config = config;
    this.elementRef = elementRef;
    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);
    this.setMinAndMaxDatesOnCalendar();
    this.setExcludedDates();
    this.setExcludedDays();
    this.setWeekStartDay();
  }

  /**
   * Sets the DatePickerConfig.minDate and DatePickerConfig.maxDate from dd/MM/yyyy to Date format
   * and adjusts the currentDate accordingly
   */
  private setMinAndMaxDatesOnCalendar(): void {
    if (this.config.minDate) {
      this.minDate = formatDateFromString(this.config.minDate, null);
      if (this.minDate && this.currentDate < this.minDate) {
        this.currentDate = this.minDate;
      }
    }

    if (this.config.maxDate) {
      this.maxDate = formatDateFromString(this.config.maxDate, null);
      if (this.maxDate && this.currentDate > this.maxDate) {
        this.currentDate = this.maxDate;
      }
    }
  }

  /**
   * Parses the DatePickerConfig.excludedDates from string and sets to config.excludedDates to Dates[]
   * Can handle either a format of separate dates "dd/MM/yyyy" or "dd/MM/yyyy dd/MM/yyyy"
   * or a date range "dd/MM/yyyy-dd/MM/yyyy"
   */
  private setExcludedDates(): void {
    if (this.config?.excludedDates) {
      const excludedDates = this.config.excludedDates
        .replace(/\s+/, ' ')
        .split(' ')
        .map((item) => {
          return item.includes('-') ? this.parseDateRangeString(item) : formatDateFromString(item);
        })
        .flat()
        .filter((item) => item);
      this.excludedDates.set(excludedDates);
    }
  }

  /**
   * Configures the excluded days based on the provided configuration.
   * Adjusts and normalizes the day labels to account for the specified week start day
   * and maps the excluded day names to their corresponding indices.
   */
  private setExcludedDays(): void {
    if (this.config?.excludedDays) {
      const weekDays = [...this.dayLabels()];
      if (this.config.weekStartDay === 'Monday') {
        weekDays.unshift(weekDays.pop());
      }

      const excludedDays = this.config.excludedDays.map((item) => weekDays.indexOf(item)).filter((item) => item !== -1);
      this.excludedDays.set(excludedDays);
    }
  }

  /**
   * Adjusts the order of day labels based on the configured week start day.
   * If the week starts on Sunday, the day labels are shifted to reflect this.
   */
  private setWeekStartDay() {
    if (this.config.weekStartDay === 'Sunday') {
      this.dayLabels.update((dayLabels) => {
        dayLabels.unshift(dayLabels.pop());
        return dayLabels;
      });
    }
  }

  /**
   * Parses a date range string and generates an array of all dates within the range.
   * @param dateRangeString - A string representing a range of dates, formatted as "dd/MM/yyyy-dd/MM/yyyy".
   * @return - An array of Date objects representing each day within the specified range.
   */
  private parseDateRangeString(dateRangeString: string): Date[] {
    const dates = [];
    const [startDate, endDate] = dateRangeString.split('-').map((d) => formatDateFromString(d, null));

    if (startDate && endDate) {
      const date = new Date(startDate.getTime());
      while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }
    }
    return dates;
  }

  /**
   * Checks if a date is excluded from being selected.
   * A date is excluded if it's before the minimum date, after the maximum date,
   * present in the array of excluded dates, or falls on an excluded day of the week.
   * @param date The date to check.
   */
  private isExcludedDate(date: Date) {
    if (this.minDate && this.minDate > date) {
      return true;
    }

    if (this.maxDate && this.maxDate < date) {
      return true;
    }

    if (this.excludedDates()) {
      for (const excludedDate of this.excludedDates()) {
        if (date.toDateString() === excludedDate.toDateString()) {
          return true;
        }
      }
    }

    return this.excludedDays() ? this.excludedDays().includes(date.getDay()) : false;
  }

  /**
   * Updates the calendar display with the dates for the current month.
   * Calculates the dates to display, taking into account the week start day and
   * sets the CalendarDate[]
   */
  updateCalendar(): void {
    // Sets the title of the dialog to the current month and year.
    this.dialogTitle.set(`${monthLabels[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`);

    const day = this.currentDate;
    const firstOfMonth = new Date(day.getFullYear(), day.getMonth(), 1);
    let dayOfWeek: number;

    // Adjusts the day of the week based on the configured week start day.
    if (this.config.weekStartDay === 'Monday') {
      dayOfWeek = firstOfMonth.getDay() === 0 ? 6 : firstOfMonth.getDay() - 1;
    } else {
      dayOfWeek = firstOfMonth.getDay();
    }

    // Calculates the first day to display on the calendar grid.
    firstOfMonth.setDate(firstOfMonth.getDate() - dayOfWeek);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    // Temporary Date object that will be increased by 1 in loop
    let thisDay = new Date(firstOfMonth);
    thisDay.setHours(0, 0, 0, 0);
    const calendarDates: CalendarDate[] = [];
    // Generates the calendar dates for a 6x7 grid (42 days)
    for (let i = 0; i < 42; i++) {
      const newCalendarDate: CalendarDate = {
        date: thisDay,
        isCurrent: false,
        isToday: thisDay.getTime() === todayDate.getTime(),
        isSelected: false,
        isDisabled: this.isExcludedDate(thisDay),
        isHidden: thisDay.getMonth() !== day.getMonth(),
        isTabbable: false,
      };
      calendarDates.push(newCalendarDate);

      thisDay = new Date(thisDay);
      thisDay.setDate(thisDay.getDate() + 1);
    }

    this.calendarDates.set(calendarDates);
  }

  /**
   * Sets the current date and updates the CalendarDate[] properties.
   * @param focus - Whether to set focus to the current date. Defaults to true.
   */
  private setCurrentDate(focus = true) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tabbableFound = false;
    this.calendarDates.update((calendarDates) =>
      calendarDates.map((calendarDate) => {
        const thisDay = new Date(calendarDate.date);
        thisDay.setHours(0, 0, 0, 0);

        const newCalendarDate: CalendarDate = {
          ...calendarDate,
          isTabbable: thisDay.getTime() === this.currentDate.getTime() && focus,
          isSelected: thisDay.getTime() === this.currentDate.getTime() && focus,
          isCurrent: this.inputDate() && thisDay.getTime() === this.inputDate().getTime(),
          isToday: thisDay.getTime() === today.getTime(),
        };

        // If focus is false, finds the first non-hidden and non-disabled date and makes it tabbable.
        if (!focus && !tabbableFound && !calendarDate.isHidden && !calendarDate.isDisabled) {
          newCalendarDate.isTabbable = true;
          this.currentDate = newCalendarDate.date;
          tabbableFound = true;
        }

        return newCalendarDate;
      }),
    );
  }

  /**
   * Selects a date from the calendar.
   * Use with events on DatePickerComponent.
   * @param calendarDate - The CalendarDate to select.
   */
  selectDate(calendarDate: CalendarDate) {
    if (this.isExcludedDate(calendarDate.date)) {
      return;
    }
    this.goToDate(calendarDate.date);
    this.inputDate.set(calendarDate.date);
    this.closeDialog();
  }

  /**
   * Toggles the calendar dialog.
   * Use with events on DatePickerComponent.
   * @param event - The event that triggered the toggle.
   */
  toggleDialog(event: Event) {
    event.preventDefault();
    if (this.isDialogOpen()) {
      this.closeDialog();
    } else {
      this.openDialog();
    }
  }

  /**
   * Closes the calendar dialog
   * and sets focus back to the toggle button after closing.
   * Use with events on DatePickerComponent.
   */
  closeDialog() {
    this.isDialogOpen.set(false);
    this.elementRef.nativeElement.querySelector('.moj-js-datepicker-toggle').focus();
  }

  /**
   * Opens the calendar dialog, resets minDate and maxDate, sets the currentDate
   * and updates the calendar
   */
  private openDialog() {
    this.setMinAndMaxDatesOnCalendar();
    this.currentDate = this.inputDate() ?? new Date();
    this.currentDate.setHours(0, 0, 0, 0);

    this.updateCalendar();
    this.setCurrentDate();
    this.setDialogPosition();
    this.isDialogOpen.set(true);
  }

  /**
   * Navigates to a specific date.
   * Sets the currentDate and updates the calendar if current month will be changed.
   * @param date - The date to navigate to.
   * @param focus - Whether to set focus to the date.
   */
  private goToDate(date: Date, focus?: boolean) {
    const previousDate = this.currentDate;
    this.currentDate = date;
    if (
      previousDate.getMonth() !== this.currentDate.getMonth() ||
      previousDate.getFullYear() !== this.currentDate.getFullYear()
    ) {
      this.updateCalendar();
    }

    this.setCurrentDate(focus);
  }

  /**
   * Focuses on the previous day.
   * Use with events on DatePickerComponent.
   */
  focusPreviousDay() {
    const date = new Date(this.currentDate);
    date.setDate(date.getDate() - 1);
    this.goToDate(date, true);
  }

  /**
   * Focuses on the next day.
   * Use with events on DatePickerComponent.
   */
  focusNextDay() {
    const date = new Date(this.currentDate);
    date.setDate(date.getDate() + 1);
    this.goToDate(date, true);
  }

  /**
   * Focuses on the first day of the current week.
   * Use with events on DatePickerComponent.
   */
  focusFirstDayOfWeek() {
    const date = new Date(this.currentDate);
    const firstDayOfWeekIndex = this.config.weekStartDay === 'Sunday' ? 0 : 1;
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek >= firstDayOfWeekIndex ? dayOfWeek - firstDayOfWeekIndex : 6 - dayOfWeek;

    date.setDate(date.getDate() - diff);
    date.setHours(0, 0, 0, 0);

    this.goToDate(date);
  }

  /**
   * Focuses on the last day of the current week.
   * Use with events on DatePickerComponent.
   */
  focusLastDayOfWeek() {
    const date = new Date(this.currentDate);
    const lastDayOfWeekIndex = this.config.weekStartDay === 'Sunday' ? 6 : 0;
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek <= lastDayOfWeekIndex ? lastDayOfWeekIndex - dayOfWeek : 7 - dayOfWeek;

    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);

    this.goToDate(date);
  }

  /**
   * Focuses on the previous week.
   * Use with events on DatePickerComponent.
   */
  focusPreviousWeek() {
    const date = new Date(this.currentDate);
    date.setDate(date.getDate() - 7);
    this.goToDate(date, true);
  }

  /**
   * Focuses on the next week.
   * Use with events on DatePickerComponent.
   */
  focusNextWeek() {
    const date = new Date(this.currentDate);
    date.setDate(date.getDate() + 7);
    this.goToDate(date, true);
  }

  /**
   * Focuses on the previous month.
   * Use with events on DatePickerComponent.
   */
  focusPreviousMonth(focus = true) {
    const date = new Date(this.currentDate);
    date.setMonth(date.getMonth() - 1, 1);
    this.goToDate(date, focus);
  }

  /**
   * Focuses on the next month.
   * Use with events on DatePickerComponent.
   */
  focusNextMonth(focus = true) {
    const date = new Date(this.currentDate);
    date.setMonth(date.getMonth() + 1, 1);
    this.goToDate(date, focus);
  }

  /**
   * Focuses on the previous year.
   * Use with events on DatePickerComponent.
   */
  focusPreviousYear(focus = true) {
    const date = new Date(this.currentDate);
    date.setFullYear(date.getFullYear() - 1, date.getMonth(), 1);
    this.goToDate(date, focus);
  }

  /**
   * Focuses on the next year.
   * Use with events on DatePickerComponent.
   */
  focusNextYear(focus = true) {
    const date = new Date(this.currentDate);
    date.setFullYear(date.getFullYear() + 1, date.getMonth(), 1);
    this.goToDate(date, focus);
  }

  /**
   * Handles keyboard navigation within the calendar.
   * Use with events on DatePickerComponent.
   * @param event - KeyboardEvent that was triggered
   */
  onDateKeyPress(event: KeyboardEvent): void {
    let calendarNavKey = true;

    switch (event.key) {
      case 'ArrowLeft':
        this.focusPreviousDay();
        break;
      case 'ArrowRight':
        this.focusNextDay();
        break;
      case 'ArrowUp':
        this.focusPreviousWeek();
        break;
      case 'ArrowDown':
        this.focusNextWeek();
        break;
      case 'Home':
        this.focusFirstDayOfWeek();
        break;
      case 'End':
        this.focusLastDayOfWeek();
        break;
      case 'PageUp':
        event.shiftKey ? this.focusPreviousYear() : this.focusPreviousMonth();
        break;
      case 'PageDown':
        event.shiftKey ? this.focusNextYear() : this.focusNextMonth();
        break;
      default:
        calendarNavKey = false;
        break;
    }

    if (calendarNavKey) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Sets the position of the dialog relative to the input.
   * If the dialog overflows to the right side of the viewport, it is positioned to the right of the input instead.
   */
  private setDialogPosition(): void {
    requestAnimationFrame(() => {
      const dialog: HTMLElement = this.elementRef.nativeElement.querySelector('.moj-datepicker__dialog');
      const input: HTMLElement = this.elementRef.nativeElement.querySelector('.govuk-input__wrapper');
      if (!dialog || !input) {
        return;
      }

      const inputLeft = input.getBoundingClientRect().left;
      const dialogWidth = dialog.offsetWidth;
      const scrollbarOffset = 10;
      const spaceToRight = window.innerWidth - (inputLeft + dialogWidth + scrollbarOffset);

      dialog.style.top = `${input.offsetHeight + 3}px`;

      if (spaceToRight >= 0) {
        dialog.style.left = '0';
        dialog.style.right = 'auto';
      } else {
        dialog.style.right = '0';
        dialog.style.left = 'auto';
      }
    });
  }

  /**
   * Handles clicks on the background of the calendar dialog, closing it if the click
   * is outside the dialog, input field, and toggle button.
   * @param event - The click event.
   */
  onBackgroundClick(event: Event) {
    const clickedElement = event.target as HTMLElement;
    const dialogContainer = this.elementRef?.nativeElement.querySelector('.moj-datepicker__dialog');
    const inputContainer = this.elementRef?.nativeElement.querySelector('input');
    const calendarButton = this.elementRef?.nativeElement.querySelector('.moj-datepicker__toggle');
    if (
      this.isDialogOpen() &&
      !dialogContainer.contains(clickedElement) &&
      !inputContainer.contains(clickedElement) &&
      !calendarButton.contains(clickedElement)
    ) {
      event.preventDefault();
      this.closeDialog();
    }
  }
}
