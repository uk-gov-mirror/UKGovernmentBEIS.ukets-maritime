import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { of, throwError } from 'rxjs';

import { UsersSecuritySetupService } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ErrorCodes } from '@netz/common/error';
import { BasePage, mockClass } from '@netz/common/testing';

import { Change2faComponent } from '@two-fa/change-2fa/change-2fa.component';

describe('Change2faComponent', () => {
  let component: Change2faComponent;
  let fixture: ComponentFixture<Change2faComponent>;
  let page: Page;
  let router: Router;
  let authStore: AuthStore;
  const usersSecuritySetupService = mockClass(UsersSecuritySetupService);

  class Page extends BasePage<Change2faComponent> {
    set passwordValue(value: string) {
      this.setInputValue('#password', value);
    }

    get confirmationPanel() {
      return this.query<HTMLDivElement>('.govuk-panel');
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Change2faComponent],
      providers: [provideRouter([]), { provide: UsersSecuritySetupService, useValue: usersSecuritySetupService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Change2faComponent);
    authStore = TestBed.inject(AuthStore);
    component = fixture.componentInstance;
    page = new Page(fixture);
    router = TestBed.inject(Router);
    fixture.detectChanges();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display errors', () => {
    expect(page.submitButton.disabled).toBeFalsy();

    page.submitButton.click();
    fixture.detectChanges();
    expect(page.errorSummaryListContents).toEqual(['Enter the 6-digit code']);

    page.passwordValue = '123abc';
    page.submitButton.click();
    fixture.detectChanges();
    expect(page.errorSummaryListContents).toEqual(['Digit code must contain numbers only']);

    page.passwordValue = '123';
    page.submitButton.click();
    fixture.detectChanges();
    expect(page.errorSummaryListContents).toEqual(['Digit code must contain exactly 6 characters']);

    page.passwordValue = '1234567';
    page.submitButton.click();
    fixture.detectChanges();
    expect(page.errorSummaryListContents).toEqual(['Digit code must contain exactly 6 characters']);
  });

  it('should submit the request change', () => {
    usersSecuritySetupService.requestTwoFactorAuthChange.mockReturnValueOnce(of({}) as any);
    authStore.setUser({ email: 'asd@asd.com', firstName: 'First', lastName: 'Last' });

    page.passwordValue = '123456';
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeFalsy();

    expect(usersSecuritySetupService.requestTwoFactorAuthChange).toHaveBeenCalledTimes(1);
    expect(usersSecuritySetupService.requestTwoFactorAuthChange).toHaveBeenCalledWith({ password: '123456' });
    expect(page.confirmationPanel).toBeTruthy();
  });

  it('on returning error should navigate to invalid code error page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    usersSecuritySetupService.requestTwoFactorAuthChange.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { code: ErrorCodes.OTP1001 } })),
    );

    page.passwordValue = '123456';
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeFalsy();

    expect(usersSecuritySetupService.requestTwoFactorAuthChange).toHaveBeenCalledTimes(1);
    expect(usersSecuritySetupService.requestTwoFactorAuthChange).toHaveBeenCalledWith({ password: '123456' });
    expect(page.confirmationPanel).toBeFalsy();
    expect(navigateSpy).toHaveBeenCalledWith(['2fa', 'invalid-code']);
  });
});
