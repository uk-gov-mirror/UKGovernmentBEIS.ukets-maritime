import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import { OperatorUsersRegistrationService } from '@mrtm/api';

import { PageHeadingComponent } from '@netz/common/components';
import { BasePage, MockType } from '@netz/common/testing';

import { ChoosePasswordComponent } from '@registration/choose-password/choose-password.component';
import { UserRegistrationStore } from '@registration/store/user-registration.store';

describe('ChoosePasswordComponent', () => {
  let component: ChoosePasswordComponent;
  let fixture: ComponentFixture<ChoosePasswordComponent>;
  let page: Page;

  class Page extends BasePage<ChoosePasswordComponent> {
    get emailValue() {
      return this.getInputValue('#email');
    }

    get passwordValue() {
      return this.getInputValue('#password');
    }

    set passwordValue(password: string) {
      this.setInputValue('#password', password);
    }

    get repeatedPasswordValue() {
      return this.query<HTMLInputElement>('#validatePassword').value;
    }

    set repeatedPasswordValue(password: string) {
      this.setInputValue('#validatePassword', password);
    }

    get submitButton() {
      return this.query<HTMLButtonElement>('button[type="submit"]');
    }
  }

  const operatorUsersRegistrationService: MockType<OperatorUsersRegistrationService> = {
    acceptAuthorityAndSetCredentialsToUser: vi.fn().mockReturnValue(of(null)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoosePasswordComponent, PageHeadingComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        UserRegistrationStore,
        { provide: OperatorUsersRegistrationService, useValue: operatorUsersRegistrationService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoosePasswordComponent);
    component = fixture.debugElement.componentInstance;
    component['form'].controls['password'].clearAsyncValidators();
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fill form from store', inject([UserRegistrationStore], (store: UserRegistrationStore) => {
    store.setState({ password: 'password', email: 'test@netz.uk' });

    fixture.detectChanges();

    expect(page.emailValue).toBe('test@netz.uk');
    expect(page.passwordValue).toBe('password');
    expect(page.repeatedPasswordValue).toBe('password');
  }));

  it('should submit only if form valid', inject([Router], (router: Router) => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    page.passwordValue = '';
    page.repeatedPasswordValue = '';
    page.submitButton.click();
    fixture.detectChanges();

    page.passwordValue = 'test';
    page.submitButton.click();
    fixture.detectChanges();
    expect(navigateSpy).not.toHaveBeenCalled();

    page.passwordValue = 'ThisIsAStrongP@ssw0rd';
    page.repeatedPasswordValue = 'ThisIsAStrongP@ssw0rd';

    page.submitButton.click();
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalled();
  }));

  it('should navigate to summary when creating an operator from an emitter', inject(
    [Router, UserRegistrationStore],
    (router: Router, store: UserRegistrationStore) => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const token = 'thisisatoken';
      const password = 'ThisIsAStrongP@ssw0rd';

      store.setState({
        invitationStatus: 'ALREADY_REGISTERED_SET_PASSWORD_ONLY',
        token: token,
        password: password,
      });

      page.passwordValue = password;
      page.repeatedPasswordValue = password;

      page.submitButton.click();
      fixture.detectChanges();

      expect(operatorUsersRegistrationService.acceptAuthorityAndSetCredentialsToUser).toHaveBeenCalledWith({
        invitationToken: token,
        password: password,
      });

      expect(navigateSpy).toHaveBeenCalledWith(['../success'], {
        relativeTo: TestBed.inject(ActivatedRoute),
      });
    },
  ));
});
