import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  CalendarDate,
  DatePickerConfig,
  datePickerConfigDefaults,
} from '@shared/components/date-picker/date-picker.interface';
import { DatePickerService } from '@shared/components/date-picker/date-picker.service';

describe('DatePickerService', () => {
  let service: DatePickerService;
  const mockElementRef: ElementRef = {
    nativeElement: {
      querySelector: (selector: string) => {
        switch (selector) {
          case '.moj-js-datepicker-toggle':
            return {
              focus: () => {},
            };
          case '.moj-datepicker__dialog':
            return { contains: () => false, offsetWidth: 0, style: {} }; // Mock contains for dialog
          case '.govuk-input__wrapper':
            return {
              getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 }) as DOMRect,
              offsetHeight: 0,
            };
          case 'input':
            return { contains: () => false }; // Mock contains for input
          case '.moj-datepicker__toggle':
            return { contains: () => false }; // Mock contains for toggle
          default:
            return {};
        }
      },
    },
  } as ElementRef;
  const mockEvent = {
    preventDefault: () => {},
  } as Event;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatePickerService],
    });
    service = TestBed.inject(DatePickerService);
    service.init(datePickerConfigDefaults, mockElementRef);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize correctly', () => {
    const config: DatePickerConfig = {
      minDate: '01/01/2024',
      maxDate: '31/12/2024',
      excludedDates: '15/01/2024 20/01/2024-22/01/2024',
      excludedDays: ['Monday', 'Sunday'],
      weekStartDay: 'Monday',
      leadingZeros: true,
    };
    service.init(config, mockElementRef);

    expect(service.dayLabels()).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    expect(service['minDate']).toEqual(new Date(2024, 0, 1));
    expect(service['maxDate']).toEqual(new Date(2024, 11, 31));
    expect(service.excludedDates()).toEqual([
      new Date(2024, 0, 15),
      new Date(2024, 0, 20),
      new Date(2024, 0, 21),
      new Date(2024, 0, 22),
    ]);
    expect(service.excludedDays()).toEqual([1, 0]);
  });

  it('should handle date range parsing correctly', () => {
    const dates = service['parseDateRangeString']('10/01/2024-12/01/2024');
    expect(dates.length).toBe(3);
    expect(dates[0]).toEqual(new Date(2024, 0, 10));
    expect(dates[2]).toEqual(new Date(2024, 0, 12));
  });

  it('should check if a date is excluded', () => {
    const config: DatePickerConfig = {
      leadingZeros: true,
      minDate: '01/01/2024',
      maxDate: '31/12/2024',
      excludedDates: '15/01/2024',
      excludedDays: ['Saturday'],
      weekStartDay: 'Monday',
    };
    service.init(config, mockElementRef);

    expect(service['isExcludedDate'](new Date(2023, 11, 31))).toBeTruthy(); // Before minDate
    expect(service['isExcludedDate'](new Date(2025, 0, 1))).toBeTruthy(); // After maxDate
    expect(service['isExcludedDate'](new Date(2024, 0, 15))).toBeTruthy(); // Excluded Date
    expect(service['isExcludedDate'](new Date(2024, 0, 6))).toBeTruthy(); // Saturday
    expect(service['isExcludedDate'](new Date(2024, 0, 16))).toBeFalsy(); // Valid Date
  });

  it('should update calendar correctly', () => {
    service.updateCalendar();
    expect(service.calendarDates().length).toBe(42);
    expect(service.dialogTitle()).toBeTruthy();
  });

  it('should select a date', () => {
    const mockCalendarDate: CalendarDate = {
      date: new Date(),
      isCurrent: false,
      isSelected: false,
      isDisabled: false,
      isHidden: false,
      isTabbable: false,
      isToday: false,
    };
    service.selectDate(mockCalendarDate);
    expect(service.inputDate()).toEqual(mockCalendarDate.date);
  });

  it('should toggle and close dialog', () => {
    service.toggleDialog(mockEvent);
    expect(service.isDialogOpen()).toBeTruthy();
    service.closeDialog();
    expect(service.isDialogOpen()).toBeFalsy();
  });

  it('should focus on previous day', () => {
    service['currentDate'] = new Date(2024, 0, 11);
    service.updateCalendar();
    service.focusPreviousDay();

    const expectedDate = new Date(2024, 0, 10);

    expect(service['currentDate'].getFullYear()).toBe(expectedDate.getFullYear());
    expect(service['currentDate'].getMonth()).toBe(expectedDate.getMonth());
    expect(service['currentDate'].getDate()).toBe(expectedDate.getDate());
  });

  it('should focus on next day', () => {
    service['currentDate'] = new Date(2024, 0, 11);
    service.updateCalendar();
    service.focusNextDay();

    const expectedDate = new Date(2024, 0, 12);

    expect(service['currentDate'].getFullYear()).toBe(expectedDate.getFullYear());
    expect(service['currentDate'].getMonth()).toBe(expectedDate.getMonth());
    expect(service['currentDate'].getDate()).toBe(expectedDate.getDate());
  });

  it('should focus on first day of week', () => {
    service['currentDate'] = new Date(2024, 0, 11);
    service.updateCalendar();
    service.focusFirstDayOfWeek();

    const expectedDate = new Date(2024, 0, 8);

    expect(service['currentDate'].getFullYear()).toBe(expectedDate.getFullYear());
    expect(service['currentDate'].getMonth()).toBe(expectedDate.getMonth());
    expect(service['currentDate'].getDate()).toBe(expectedDate.getDate());
  });

  it('should focus on last day of week', () => {
    service['currentDate'] = new Date(2024, 0, 11);
    service.updateCalendar();
    service.focusLastDayOfWeek();

    const expectedDate = new Date(2024, 0, 14);

    expect(service['currentDate'].getFullYear()).toBe(expectedDate.getFullYear());
    expect(service['currentDate'].getMonth()).toBe(expectedDate.getMonth());
    expect(service['currentDate'].getDate()).toBe(expectedDate.getDate());
  });

  it('should focus on the next month', () => {
    service['currentDate'] = new Date(2024, 0, 15);
    service.updateCalendar();
    service.focusNextMonth();

    const expectedDate = new Date(2024, 1, 1);

    expect(service['currentDate'].getFullYear()).toBe(expectedDate.getFullYear());
    expect(service['currentDate'].getMonth()).toBe(expectedDate.getMonth());
    expect(service['currentDate'].getDate()).toBe(expectedDate.getDate());
  });

  it('should focus on previous year', () => {
    service['currentDate'] = new Date(2024, 0, 15);
    service.updateCalendar();
    service.focusPreviousYear();

    const expectedDate = new Date(2023, 0, 1);

    expect(service['currentDate'].getFullYear()).toBe(expectedDate.getFullYear());
    expect(service['currentDate'].getMonth()).toBe(expectedDate.getMonth());
    expect(service['currentDate'].getDate()).toBe(expectedDate.getDate());
  });

  it('should focus on next year', () => {
    service['currentDate'] = new Date(2024, 0, 15);
    service.updateCalendar();
    service.focusNextYear();

    const expectedDate = new Date(2025, 0, 1);

    expect(service['currentDate'].getFullYear()).toBe(expectedDate.getFullYear());
    expect(service['currentDate'].getMonth()).toBe(expectedDate.getMonth());
    expect(service['currentDate'].getDate()).toBe(expectedDate.getDate());
  });

  it('should handle DateKeyPress', () => {
    const event = (keyPress: string, shiftKey = false) =>
      ({
        key: keyPress,
        shiftKey: shiftKey,
        preventDefault: () => {},
        stopPropagation: () => {},
      }) as KeyboardEvent;

    const focusPreviousDaySpy = vi.spyOn(service, 'focusPreviousDay');
    const focusNextDaySpy = vi.spyOn(service, 'focusNextDay');
    const focusPreviousWeekSpy = vi.spyOn(service, 'focusPreviousWeek');
    const focusNextWeekSpy = vi.spyOn(service, 'focusNextWeek');
    const focusFirstDayOfWeekSpy = vi.spyOn(service, 'focusFirstDayOfWeek');
    const focusLastDayOfWeekSpy = vi.spyOn(service, 'focusLastDayOfWeek');
    const focusPreviousMonthSpy = vi.spyOn(service, 'focusPreviousMonth');
    const focusNextMonthSpy = vi.spyOn(service, 'focusNextMonth');
    const focusPreviousYearSpy = vi.spyOn(service, 'focusPreviousYear');
    const focusNextYearSpy = vi.spyOn(service, 'focusNextYear');

    service.onDateKeyPress(event('ArrowLeft'));
    expect(focusPreviousDaySpy).toHaveBeenCalledTimes(1);

    service.onDateKeyPress(event('ArrowRight'));
    expect(focusNextDaySpy).toHaveBeenCalledTimes(1);

    service.onDateKeyPress(event('ArrowUp'));
    expect(focusPreviousWeekSpy).toHaveBeenCalledTimes(1);

    service.onDateKeyPress(event('ArrowDown'));
    expect(focusNextWeekSpy).toHaveBeenCalledTimes(1);

    service.onDateKeyPress(event('Home'));
    expect(focusFirstDayOfWeekSpy).toHaveBeenCalledTimes(1);

    service.onDateKeyPress(event('End'));
    expect(focusLastDayOfWeekSpy).toHaveBeenCalledTimes(1);

    service.onDateKeyPress(event('PageUp'));
    expect(focusPreviousMonthSpy).toHaveBeenCalledTimes(1);

    service.onDateKeyPress(event('PageDown'));
    expect(focusNextMonthSpy).toHaveBeenCalledTimes(1);

    service.onDateKeyPress(event('PageUp', true));
    expect(focusPreviousYearSpy).toHaveBeenCalledTimes(1);

    service.onDateKeyPress(event('PageDown', true));
    expect(focusNextYearSpy).toHaveBeenCalledTimes(1);
  });

  it('should close the dialog if clicked outside dialog, input, and toggle', () => {
    vi.spyOn(service, 'closeDialog');
    service.isDialogOpen.set(true);
    const event = { ...mockEvent, target: {} } as Event; // Mock target to be outside
    service.onBackgroundClick(event);

    expect(service.closeDialog).toHaveBeenCalled();
  });
});
