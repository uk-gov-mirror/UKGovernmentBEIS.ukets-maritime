import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlContainer, FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { GovukValidators, LabelSizeType } from '@netz/govuk-components';

import { datePickerConfigDefaults } from '@shared/components/date-picker//date-picker.interface';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';

describe('DatePickerComponent', () => {
  @Component({
    imports: [DatePickerComponent, ReactiveFormsModule],
    standalone: true,
    template: `
      <div
        label="Select date"
        mrtm-date-picker
        [formControl]="control"
        [datePickerConfig]="DatePickerConfigDefaults"
        [isLabelHidden]="isLabelHidden()"
        [labelSize]="labelSize()"></div>
    `,
  })
  class TestComponent {
    control = new FormControl();
    readonly isLabelHidden = signal<boolean>(false);
    readonly labelSize = signal<LabelSizeType>('normal');
    protected readonly DatePickerConfigDefaults = datePickerConfigDefaults;
  }

  let component: DatePickerComponent;
  let hostComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ControlContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    hostComponent = fixture.componentInstance;
    element = fixture.nativeElement;
    component = fixture.debugElement.query(By.directive(DatePickerComponent)).componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should disable the date-picker input and the date-picker toggle button', async () => {
    hostComponent.control.disable();
    fixture.detectChanges();

    const inputElement = element.querySelector<HTMLInputElement>('input');
    expect(inputElement.disabled).toBeTruthy();

    const datepickerToggleButtonElement = element.querySelector<HTMLButtonElement>('.moj-datepicker__toggle');
    expect(datepickerToggleButtonElement.disabled).toBeTruthy();
  });

  it('should assign value', async () => {
    const stringValue = '2024-01-01T00:00:00.000Z';
    hostComponent.control.patchValue(stringValue);
    fixture.detectChanges();

    const inputElement = element.querySelector<HTMLInputElement>('input');
    expect(hostComponent.control.valid).toBeTruthy();
    expect(inputElement.value).toEqual(stringValue);
  });

  it('should apply validators', () => {
    hostComponent.control.clearValidators();
    hostComponent.control.setValidators(GovukValidators.required('Date is required'));
    hostComponent.control.updateValueAndValidity();
    fixture.detectChanges();

    expect(element.querySelector('.govuk-error-message').textContent.trim()).toEqual('Error: Date is required');
    expect(element.querySelector('.govuk-character-count__message.govuk-error-message')).toBeNull();
  });

  it('should display labelSize classes', () => {
    const hostElement: HTMLElement = fixture.nativeElement;
    const label = hostElement.querySelector('label');

    hostComponent.isLabelHidden.set(false);
    fixture.detectChanges();

    expect(label.className).toEqual('govuk-label');

    hostComponent.labelSize.set('small');
    fixture.detectChanges();

    expect(label.className).toEqual('govuk-label govuk-label--s');

    hostComponent.labelSize.set('medium');
    fixture.detectChanges();

    expect(label.className).toEqual('govuk-label govuk-label--m');

    hostComponent.labelSize.set('large');
    fixture.detectChanges();

    expect(label.className).toEqual('govuk-label govuk-label--l');
  });
});
