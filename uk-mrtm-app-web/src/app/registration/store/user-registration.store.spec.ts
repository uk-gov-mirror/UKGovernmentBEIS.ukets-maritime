import { TestBed } from '@angular/core/testing';

import { firstValueFrom, of } from 'rxjs';

import { OperatorUserRegistrationWithCredentialsDTO } from '@mrtm/api';

import { CountryService } from '@core/services/country.service';
import { UserRegistrationStore } from '@registration/store/user-registration.store';
import { CountryServiceStub } from '@registration/testing/country-service-stub';

describe('UserRegistrationStore', () => {
  let store: UserRegistrationStore;

  const mockUserDTO: OperatorUserRegistrationWithCredentialsDTO = {
    firstName: 'John',
    lastName: 'Doe',
    emailToken: 'test@email.com',
    password: 'test',
    phoneNumber: {
      countryCode: '44',
      number: '123',
    },
    mobileNumber: {
      countryCode: null,
      number: null,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: CountryService, useClass: CountryServiceStub }],
    });
    store = TestBed.inject(UserRegistrationStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should return user info summary', async () => {
    vi.spyOn(store, 'select').mockReturnValue(of(mockUserDTO));

    const summary = await firstValueFrom(store.select('userRegistrationDTO'));

    expect(summary.firstName).toEqual('John');
    expect(summary.lastName).toEqual('Doe');
    expect(summary.phoneNumber.number).toEqual('123');
    expect(summary.phoneNumber.countryCode).toEqual('44');
    expect(summary.mobileNumber.number).toEqual(null);
    expect(summary.mobileNumber.countryCode).toEqual(null);
  });
});
