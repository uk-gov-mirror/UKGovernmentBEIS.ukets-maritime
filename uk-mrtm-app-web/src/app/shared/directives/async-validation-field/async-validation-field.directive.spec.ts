import { ChangeDetectorRef, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlContainer, FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { TextInputComponent } from '@netz/govuk-components';

import { AsyncValidationFieldDirective } from '@shared/directives';

describe('AsyncValidationFieldDirective', () => {
  let directive: AsyncValidationFieldDirective;
  let fixture: ComponentFixture<TestComponent>;

  @Component({
    imports: [AsyncValidationFieldDirective, ReactiveFormsModule, TextInputComponent],
    template: '<div govuk-text-input netzAsyncValidationField [formControl]="name" label="Name"></div>',
  })
  class TestComponent {
    name = new FormControl();
  }

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      providers: [ControlContainer],
    }).createComponent(TestComponent);
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    directive = fixture.debugElement
      .query(By.directive(AsyncValidationFieldDirective))
      .injector.get(AsyncValidationFieldDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should trigger change detector on status change', () => {
    const cdRef = fixture.debugElement.injector.get(ChangeDetectorRef);
    const cdRefSpy = vi.spyOn(cdRef.constructor.prototype, 'markForCheck');

    fixture.componentInstance.name.markAsPending();
    expect(fixture.componentInstance.name.pending).toBeTruthy();
    expect(cdRefSpy).toHaveBeenCalled();

    fixture.componentInstance.name.setErrors({ invalid: true });
    expect(fixture.componentInstance.name.pending).toBeFalsy();
    expect(fixture.componentInstance.name.invalid).toBeTruthy();

    expect(cdRefSpy).toHaveBeenCalled();
  });
});
