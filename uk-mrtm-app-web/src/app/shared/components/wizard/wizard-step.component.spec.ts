import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { PageHeadingComponent } from '@netz/common/components';
import { TextInputComponent } from '@netz/govuk-components';

import { WizardStepComponent } from '@shared/components';
import { Mock } from 'vitest';

describe('WizardStepComponent', () => {
  let component: WizardStepComponent;
  let hostComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  @Component({
    imports: [WizardStepComponent, ReactiveFormsModule, TextInputComponent],
    standalone: true,
    template: `
      <mrtm-wizard-step
        [formGroup]="formGroup"
        heading="Some form"
        caption="Some caption"
        (formSubmit)="onSubmit($event)">
        <div govuk-text-input formControlName="date" label="Date"></div>
        <div govuk-text-input formControlName="text" label="Text"></div>
      </mrtm-wizard-step>
    `,
  })
  class TestComponent {
    formGroup = new FormGroup({
      date: new FormControl('', [Validators.required]),
      text: new FormControl(''),
    });
    onSubmit: ((form: FormGroup) => any) | Mock<(form: FormGroup) => void>;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeadingComponent, TestComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    element = fixture.nativeElement;
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(WizardStepComponent)).componentInstance;
    hostComponent.onSubmit = vi.fn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the nested form', () => {
    expect(element.querySelector('.govuk-caption-l')).toBeTruthy();
    expect(element.querySelector('.govuk-heading-l')).toBeTruthy();
    expect(element.querySelector('button[type="submit"]')).toBeTruthy();
    expect(element.querySelectorAll('input').length).toEqual(2);
  });

  it('should render errors on submit', () => {
    expect(element.querySelector('.govuk-error-summary')).toBeFalsy();

    element.querySelector<HTMLButtonElement>('button[type="submit"]').click();

    fixture.detectChanges();

    expect(element.querySelector('.govuk-error-summary')).toBeTruthy();
    expect(hostComponent.onSubmit).not.toHaveBeenCalled();
  });
});
