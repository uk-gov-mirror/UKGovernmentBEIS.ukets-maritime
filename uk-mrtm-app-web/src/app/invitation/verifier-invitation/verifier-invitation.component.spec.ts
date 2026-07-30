import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { of, throwError } from 'rxjs';

import { VerifierUsersRegistrationService } from '@mrtm/api';

import { ErrorCodes } from '@netz/common/error';
import { ActivatedRouteStub, BasePage, mockClass } from '@netz/common/testing';

import { VerifierInvitationComponent } from '@invitation/verifier-invitation/verifier-invitation.component';
import { Mocked } from 'vitest';

describe('VerifierInvitationComponent', () => {
  let component: VerifierInvitationComponent;
  let fixture: ComponentFixture<VerifierInvitationComponent>;
  let page: Page;
  let router: Router;
  let route: ActivatedRoute;
  let verifierUsersRegistrationService: Mocked<VerifierUsersRegistrationService>;

  class Page extends BasePage<VerifierInvitationComponent> {
    get emailValue() {
      return this.getInputValue<string>('#email');
    }

    set passwordValue(value: string) {
      this.setInputValue('#password', value);
    }

    set repeatedPasswordValue(value: string) {
      this.setInputValue('#validatePassword', value);
    }

    get submitButton() {
      return this.query<HTMLButtonElement>('button[type="submit"]');
    }
  }

  beforeEach(async () => {
    verifierUsersRegistrationService = mockClass(VerifierUsersRegistrationService);

    const activatedRoute = new ActivatedRouteStub(
      undefined,
      { token: 'token' },
      {
        invitedUser: { email: 'user@netz.uk' },
      },
    );

    await TestBed.configureTestingModule({
      imports: [VerifierInvitationComponent],
      providers: [
        provideHttpClient(),
        { provide: VerifierUsersRegistrationService, useValue: verifierUsersRegistrationService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifierInvitationComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    fixture.componentInstance['form'].controls['password'].clearAsyncValidators();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the form with email information', () => {
    expect(component['form'].get('email').value).toEqual('user@netz.uk');
    expect(page.emailValue).toEqual('user@netz.uk');
  });

  it('should navigate for link related error', () => {
    verifierUsersRegistrationService.acceptAuthorityAndActivateVerifierUserFromInvite.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: { code: ErrorCodes.EMAIL1001 }, status: 400 })),
    );
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component['form'].get('password').setValue('ThisIsAStrongP@ssw0rd');
    component['form'].get('validatePassword').setValue('ThisIsAStrongP@ssw0rd');
    page.submitButton.click();
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['invalid-link'], {
      relativeTo: route,
      queryParams: { code: ErrorCodes.EMAIL1001 },
    });

    verifierUsersRegistrationService.acceptAuthorityAndActivateVerifierUserFromInvite.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: { code: ErrorCodes.TOKEN1001 }, status: 400 })),
    );

    component['form'].get('password').setValue('ThisIsAStrongP@ssw0rd');
    page.submitButton.click();
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledTimes(2);
    expect(navigateSpy).toHaveBeenCalledWith(['invalid-link'], {
      relativeTo: route,
      queryParams: { code: ErrorCodes.TOKEN1001 },
    });
  });

  it('should submit only if form valid', () => {
    page.passwordValue = '';
    page.repeatedPasswordValue = '';
    page.submitButton.click();
    fixture.detectChanges();

    expect(verifierUsersRegistrationService.acceptAuthorityAndActivateVerifierUserFromInvite).not.toHaveBeenCalled();

    page.passwordValue = 'test';
    page.submitButton.click();
    fixture.detectChanges();

    expect(verifierUsersRegistrationService.acceptAuthorityAndActivateVerifierUserFromInvite).not.toHaveBeenCalled();

    page.passwordValue = 'ThisIsAStrongP@ssw0rd';
    page.repeatedPasswordValue = 'ThisIsAStrongP@ssw0rd';
    fixture.detectChanges();

    verifierUsersRegistrationService.acceptAuthorityAndActivateVerifierUserFromInvite.mockReturnValue(of(undefined));
    page.submitButton.click();
    fixture.detectChanges();
    expect(verifierUsersRegistrationService.acceptAuthorityAndActivateVerifierUserFromInvite).toHaveBeenCalledTimes(1);
    expect(verifierUsersRegistrationService.acceptAuthorityAndActivateVerifierUserFromInvite).toHaveBeenCalledWith({
      invitationToken: 'token',
      password: 'ThisIsAStrongP@ssw0rd',
    });
  });
});
