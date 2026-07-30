import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import {
  OperatorUserDTO,
  OperatorUserRegistrationWithCredentialsDTO,
  OperatorUsersRegistrationService,
} from '@mrtm/api';

import { PageHeadingComponent } from '@netz/common/components';
import { buttonClick } from '@netz/common/testing';

import { UserRegistrationStore } from '@registration/store/user-registration.store';
import { SummaryComponent } from '@registration/summary/summary.component';

const mockUserRegistrationDTO: OperatorUserRegistrationWithCredentialsDTO = {
  firstName: 'John',
  lastName: 'Doe',
  emailToken: 'test@email.com',
  password: 'test',
  phoneNumber: {
    countryCode: 'UK44',
    number: '123',
  },
};

const mockUserOperatorDTO: OperatorUserDTO = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'test@email.com',
  phoneNumber: {
    countryCode: 'UK44',
    number: '123',
  },
};

describe('SummaryComponent', () => {
  let component: SummaryComponent;
  let fixture: ComponentFixture<SummaryComponent>;
  let store: UserRegistrationStore;
  let router: Router;
  let service: OperatorUsersRegistrationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeadingComponent],
      providers: [provideHttpClient(), provideRouter([]), UserRegistrationStore],
    }).compileComponents();

    store = TestBed.inject(UserRegistrationStore);

    vi.spyOn(store, 'select')
      .mockReturnValueOnce(of(mockUserRegistrationDTO))
      .mockReturnValueOnce(of('password'))
      .mockReturnValueOnce(of('token'));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    service = TestBed.inject(OperatorUsersRegistrationService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create an invited user with credentials', () => {
    store.setState({
      isInvited: true,
      userRegistrationDTO: mockUserOperatorDTO,
      password: mockUserRegistrationDTO.password,
      token: mockUserRegistrationDTO.emailToken,
    });

    fixture.detectChanges();

    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(service, 'acceptAuthorityAndEnableInvitedUserWithCredentials').mockReturnValue(
      of(mockUserOperatorDTO) as any,
    );

    buttonClick(fixture);

    expect(navigateSpy).toHaveBeenCalledWith(['../success'], { relativeTo: TestBed.inject(ActivatedRoute) });
  });

  it('should create an invited user without credentials', () => {
    store.setState({
      isInvited: true,
      userRegistrationDTO: mockUserOperatorDTO,
      password: mockUserRegistrationDTO.password,
      token: mockUserRegistrationDTO.emailToken,
      invitationStatus: 'PENDING_TO_REGISTERED_SET_REGISTER_FORM_NO_PASSWORD',
    });

    fixture.detectChanges();

    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(service, 'acceptAuthorityAndEnableInvitedUserWithoutCredentials').mockReturnValue(
      of(mockUserOperatorDTO) as any,
    );

    buttonClick(fixture);

    expect(navigateSpy).toHaveBeenCalledWith(['../../invitation'], { relativeTo: TestBed.inject(ActivatedRoute) });
  });
});
