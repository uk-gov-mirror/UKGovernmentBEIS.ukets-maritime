import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { OperatorUserRegistrationDTO } from '@mrtm/api';

import { PageHeadingComponent } from '@netz/common/components';
import { BasePage } from '@netz/common/testing';

import { CountryService } from '@core/services/country.service';
import { ContactDetailsComponent } from '@registration/contact-details/contact-details.component';
import { UserRegistrationStore } from '@registration/store/user-registration.store';
import { CountryServiceStub } from '@registration/testing/country-service-stub';

describe('ContactDetailsComponent', () => {
  let component: ContactDetailsComponent;
  let fixture: ComponentFixture<ContactDetailsComponent>;
  let router: Router;
  let route: ActivatedRoute;
  let store: UserRegistrationStore;
  let page: Page;

  class Page extends BasePage<ContactDetailsComponent> {
    get firstName() {
      return this.query<HTMLInputElement>('input[name="firstName"]');
    }

    get firstNameValue() {
      return this.getInputValue(this.firstName);
    }

    set firstNameValue(value: string) {
      this.setInputValue('input[name="firstName"]', value);
    }

    get lastName() {
      return this.query<HTMLInputElement>('input[name="lastName"]');
    }

    get lastNameValue() {
      return this.getInputValue(this.lastName);
    }

    set lastNameValue(value: string) {
      this.setInputValue('input[name="lastName"]', value);
    }

    get jobTitle() {
      return this.query<HTMLInputElement>('input[name="jobTitle"]');
    }

    get countryCode() {
      return this.query<HTMLSelectElement>('select[name="phoneNumber.countryCode"]');
    }

    get countryCodeValue() {
      return this.getInputValue(this.countryCode)['countryCode'];
    }

    set countryCodeValue(value: string) {
      this.setInputValue('select[name="phoneNumber.countryCode"]', value);
    }

    get phoneNumber() {
      return this.query<HTMLInputElement>('input[name="phoneNumber"]');
    }

    get phoneNumberValue() {
      return this.getInputValue(this.phoneNumber);
    }

    set phoneNumberValue(value: string) {
      this.setInputValue('input[name="phoneNumber"]', value);
    }

    get email() {
      return this.query<HTMLInputElement>('input[name="email"]');
    }

    get emailValue() {
      return this.getInputValue(this.email);
    }

    get submitButton() {
      return this.query<HTMLButtonElement>('button[type="submit"]');
    }
  }

  @Component({
    standalone: true,
    template: '',
  })
  class NoopComponent {}

  const mockContactDetails: Omit<OperatorUserRegistrationDTO, 'emailToken'> = {
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: {
      countryCode: '30',
      number: '6946332211',
    },
    mobileNumber: {
      countryCode: null,
      number: null,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDetailsComponent, PageHeadingComponent],
      providers: [
        provideRouter([{ path: 'choose-password', component: NoopComponent }]),
        UserRegistrationStore,
        { provide: CountryService, useClass: CountryServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactDetailsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    store = TestBed.inject(UserRegistrationStore);
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fill form from state', async () => {
    store.setState({ userRegistrationDTO: mockContactDetails, email: 'test@email.com' });

    expect(page.firstNameValue).toBe(mockContactDetails.firstName);
    expect(page.lastNameValue).toBe(mockContactDetails.lastName);
    expect(page.countryCodeValue).toEqual(mockContactDetails.phoneNumber.countryCode);
    expect(page.phoneNumberValue).toBe(mockContactDetails.phoneNumber.number);
    expect(page.emailValue).toBe('test@email.com');
    expect(page.email.disabled).toBeTruthy();
  });

  it('should not submit on invalid form', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    page.firstNameValue = 'first name';
    page.lastNameValue = 'last name';
    page.countryCodeValue = '30';

    page.submitButton.click();

    expect(navigateSpy).not.toHaveBeenCalled();
    page.countryCodeValue = '30';
    page.phoneNumberValue = '306946332211';

    page.submitButton.click();

    expect(navigateSpy).toHaveBeenCalledWith(['../choose-password'], { relativeTo: route });
  });

  it('should navigate to choose password', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    store.setState({ userRegistrationDTO: mockContactDetails, isSummarized: false });

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(store.getState().userRegistrationDTO).toEqual(mockContactDetails);
    expect(navigateSpy).toHaveBeenCalledWith(['../choose-password'], { relativeTo: TestBed.inject(ActivatedRoute) });
  });

  it('should navigate to summary', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    store.setState({ userRegistrationDTO: mockContactDetails, isSummarized: true });

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(store.getState().userRegistrationDTO).toEqual(mockContactDetails);
    expect(navigateSpy).toHaveBeenCalledWith(['../summary'], { relativeTo: TestBed.inject(ActivatedRoute) });
  });

  it('should navigate to summary for emitter users', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const token = 'thisisatoken';

    store.setState({
      ...store.getState(),
      userRegistrationDTO: mockContactDetails,
      invitationStatus: 'PENDING_TO_REGISTERED_SET_REGISTER_FORM_NO_PASSWORD',
      token,
    });

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(navigateSpy).toHaveBeenCalledWith(['../summary'], {
      relativeTo: TestBed.inject(ActivatedRoute),
    });
  });
});
