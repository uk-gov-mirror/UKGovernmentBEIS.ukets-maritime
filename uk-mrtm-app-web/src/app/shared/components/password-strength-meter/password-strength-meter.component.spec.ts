import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PasswordStrengthMeterComponent } from '@shared/components/password-strength-meter/password-strength-meter.component';
import { PasswordStrengthMeterService } from '@shared/components/password-strength-meter/password-strength-meter.service';
import { Mocked } from 'vitest';

describe('PasswordStrengthMeterComponent', () => {
  let component: PasswordStrengthMeterComponent;
  let componentRef: ComponentRef<PasswordStrengthMeterComponent>;
  let fixture: ComponentFixture<PasswordStrengthMeterComponent>;
  let passwordStrengthMeterService: Partial<Mocked<PasswordStrengthMeterService>>;

  beforeEach(async () => {
    passwordStrengthMeterService = {
      score: vi.fn(),
      scoreWithFeedback: vi.fn(),
    };

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: PasswordStrengthMeterService,
          useValue: passwordStrengthMeterService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordStrengthMeterComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change the password strength as 0 when failed to meet the min password length', async () => {
    componentRef.setInput('password', '123456');
    fixture.detectChanges();

    expect(passwordStrengthMeterService.score).not.toHaveBeenCalled();
    expect(component['passwordStrength']()).toBe(0);
    expect(component['feedback']()).toBeNull();
  });

  it('should change the password strength as null on empty password', async () => {
    componentRef.setInput('password', '');
    fixture.detectChanges();
    expect(component['passwordStrength']()).toBeNull();
    expect(component['feedback']()).toBeNull();
  });

  it('should update the password strength meter', async () => {
    const passwordStrength = 3;
    passwordStrengthMeterService.score.mockReturnValue(passwordStrength);
    componentRef.setInput('password', '123asd123');
    fixture.detectChanges();

    expect(component['passwordStrength']()).toBe(passwordStrength);
  });

  it('should not emit password strength when no strength change', async () => {
    const passwordStrength = 3;
    passwordStrengthMeterService.score.mockReturnValue(passwordStrength);

    componentRef.setInput('password', '123asd123');
    fixture.detectChanges();
    expect(component['passwordStrength']()).toBe(passwordStrength);

    componentRef.setInput('password', '123asd1231');
    fixture.detectChanges();
    expect(component['passwordStrength']()).toBe(passwordStrength);
  });

  it('should display feedback on enableFeedback', () => {
    componentRef.setInput('password', '123asd123');
    componentRef.setInput('enableFeedback', false);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.psm__feedback'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.psm__suggestion'))).toBeNull();

    passwordStrengthMeterService.scoreWithFeedback.mockReturnValue({
      score: 0,
      feedback: {
        warning: 'Repeated characters like "aaa" are easy to guess.',
        suggestions: ['Add more words that are less common.', 'Avoid repeated words and characters.'],
      },
    });
    componentRef.setInput('password', '111111111');
    componentRef.setInput('enableFeedback', true);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.govuk-hint'))).toBeTruthy();
  });
});
