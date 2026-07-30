import { formatDate, SlicePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  OnInit,
  Renderer2,
  viewChild,
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, ReactiveFormsModule, ValidatorFn } from '@angular/forms';

import { distinctUntilChanged, takeUntil, tap } from 'rxjs';

import {
  ErrorMessageComponent,
  FormInput,
  GovukValidators,
  GovukWidthClass,
  LabelDirective,
  LabelSizeType,
  SafeHtmlPipe,
} from '@netz/govuk-components';

import {
  CalendarDate,
  DatePickerConfig,
  datePickerConfigDefaults,
} from '@shared/components/date-picker/date-picker.interface';
import { DatePickerService } from '@shared/components/date-picker/date-picker.service';
import { DatePickerButtonComponent } from '@shared/components/date-picker/date-picker-button/date-picker-button.component';
import { DatePickerChunkPipe } from '@shared/components/date-picker/pipes/date-picker-chunk.pipe';

@Component({
  selector: 'div[mrtm-date-picker]',
  imports: [
    ErrorMessageComponent,
    SlicePipe,
    DatePickerChunkPipe,
    DatePickerButtonComponent,
    ReactiveFormsModule,
    SafeHtmlPipe,
  ],
  standalone: true,
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  providers: [DatePickerService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onBackgroundClick($event)',
  },
})
export class DatePickerComponent extends FormInput implements ControlValueAccessor, OnInit, AfterViewInit {
  public readonly datePickerService = inject(DatePickerService);
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);

  readonly label = input<string>();
  readonly labelSize = input<LabelSizeType>('normal');
  readonly isLabelHidden = input(false);
  readonly hint = input<string>();
  readonly widthClass = input<GovukWidthClass>('govuk-!-width-full');
  readonly invalidDateFormatMessage = input<string>('Enter a valid date');
  readonly datePickerConfig = input<DatePickerConfig>(datePickerConfigDefaults);

  readonly templateLabel = contentChild(LabelDirective);
  readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly currentLabelSize = computed(() => {
    switch (this.labelSize()) {
      case 'small':
        return 'govuk-label govuk-label--s';
      case 'medium':
        return 'govuk-label govuk-label--m';
      case 'large':
        return 'govuk-label govuk-label--l';
      default:
        return 'govuk-label';
    }
  });

  disabled: boolean;
  titleId: string;
  private readonly INVALID_DATE = 'INVALID_DATE';
  private dateFormat = 'dd/MM/yyyy';

  onBackgroundClick(event: Event) {
    this.datePickerService.onBackgroundClick(event);
  }
  onChange: (dateHuman: string) => any;
  onTouched: () => any;

  constructor() {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  ngAfterViewInit(): void {
    this.dateFormat = this.datePickerConfig()?.leadingZeros ? this.dateFormat : 'd/M/yyyy';
    this.titleId = `datepicker-title-${this.identifier}`;
    this.datePickerService.init(this.datePickerConfig(), this.elementRef);
    this.datePickerService.updateCalendar();
    this.initValidators();
    this.writeValue(this.control.value);
    this.control.valueChanges
      .pipe(
        distinctUntilChanged((prev, curr) => prev === curr),
        tap((value) => {
          this.control.setValue(value, {
            emitEvent: false,
            emitViewToModelChange: false,
            emitModelToViewChange: false,
          });
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  initValidators() {
    this.control.addValidators(GovukValidators.builder(this.invalidDateFormatMessage(), this.initialValidator()));

    if (this.datePickerConfig()?.minDate) {
      this.control.addValidators(
        GovukValidators.builder(
          `This date must be the same as or after ${this.datePickerConfig().minDate}`,
          this.minDateValidator(this.parseHumanDate(this.datePickerConfig()?.minDate)),
        ),
      );
    }

    if (this.datePickerConfig()?.maxDate) {
      this.control.addValidators(
        GovukValidators.builder(
          `This date must be the same as or before ${this.datePickerConfig().maxDate}`,
          this.maxDateValidator(this.parseHumanDate(this.datePickerConfig()?.maxDate)),
        ),
      );
    }

    if (this.datePickerConfig()?.excludedDays || this.datePickerConfig()?.excludedDates) {
      this.control.addValidators(GovukValidators.builder(`This date cannot be selected`, this.excludedDateValidator()));
    }

    this.control.updateValueAndValidity();
  }

  writeValue(value: Date | string | null): void {
    if (value && this.input()) {
      const dateValue = value instanceof Date ? value : new Date(value);
      this.renderer.setProperty(this.input().nativeElement, 'value', this.convertDateToHumanDate(value));
      this.datePickerService.inputDate.set(this.toLocalDate(dateValue));
    }
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = (dateHuman: string) => {
      const convertedDate = this.convertHumanDateToDate(dateHuman);
      fn(convertedDate);
      const inputValue =
        convertedDate && convertedDate !== this.INVALID_DATE ? this.toLocalDate(new Date(convertedDate)) : null;
      this.datePickerService.inputDate.set(inputValue);
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private initialValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      return control.value === this.INVALID_DATE ? { invalidDate: true } : null;
    };
  }

  private minDateValidator(min: Date): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      return control.value !== null && control.value !== this.INVALID_DATE && control.value < min
        ? { minDate: true }
        : null;
    };
  }

  private maxDateValidator(max: Date): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      return control.value !== null && control.value !== this.INVALID_DATE && control.value > max
        ? { maxDate: true }
        : null;
    };
  }

  private excludedDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      return control.value !== null && control.value !== this.INVALID_DATE && this.isExcluded(this.control.value)
        ? { excludedDate: true }
        : null;
    };
  }

  private isExcluded(date: Date) {
    if (date instanceof Date) {
      if (this.datePickerService.excludedDates()) {
        for (const excludedDate of this.datePickerService.excludedDates()) {
          if (date.toDateString() === excludedDate.toDateString()) {
            return true;
          }
        }
      }

      return this.datePickerService.excludedDays()
        ? this.datePickerService.excludedDays().includes(date.getDay())
        : false;
    }

    return false;
  }

  onSelectDate(calendarDate: CalendarDate, event: Event) {
    if (calendarDate.isDisabled) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const utcDate = this.toUtcDate(calendarDate.date);
    this.writeValue(utcDate);
    this.onChange(this.convertDateToHumanDate(utcDate.toISOString()));
    this.datePickerService.selectDate(calendarDate);
  }

  /**
   * Select current date but if none is selected, choose the first tabbable
   * Prevent selection when currentDate is not found, this covers cases where a selected date is excluded
   */
  onOkButtonClick(event: Event) {
    let currentDate = this.datePickerService.calendarDates().find((calendarDate) => calendarDate.isSelected);
    if (!currentDate) {
      currentDate = this.datePickerService.calendarDates().find((calendarDate) => calendarDate.isTabbable);
    }
    if (currentDate) {
      this.onSelectDate(currentDate, event);
    }
  }

  onCancelButtonClick(event: Event) {
    this.datePickerService.toggleDialog(event);
  }

  onHandleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.datePickerService.closeDialog();
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private convertHumanDateToDate(dateString?: string): Date | string | null {
    dateString = dateString?.trim();

    if (!dateString) {
      return null;
    }

    return this.isValidHumanDate(dateString) ? this.parseHumanDate(dateString) : this.INVALID_DATE;
  }

  private isValidHumanDate(dateString?: string): boolean {
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }
    const [day, month, year] = dateString.split('/').map(Number);
    const date = this.parseHumanDate(dateString);

    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  private parseHumanDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  private convertDateToHumanDate(value: string | number | Date): string {
    return formatDate(value, this.dateFormat, 'en-GB', 'UTC');
  }

  /**
   * Converts a UTC-midnight date (as produced by parseHumanDate / the control value)
   * into a local-midnight date representing the same calendar day.
   * The date picker calendar works in local time, so the inputDate must be local
   * to highlight the correct day regardless of the user's timezone.
   */
  private toLocalDate(value: Date): Date {
    return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }

  /**
   * Converts a local-midnight date (as produced by the calendar) into a UTC-midnight
   * date representing the same calendar day.
   * The calendar works in local time, while parsing/formatting and the payload are
   * UTC-based, so a selected calendar date must be normalized to UTC midnight to keep
   * the input text, calendar highlight and payload consistent regardless of timezone.
   */
  private toUtcDate(value: Date): Date {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }
}
