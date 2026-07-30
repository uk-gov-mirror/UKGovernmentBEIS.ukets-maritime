import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';

import { CountryService } from '@core/services';
import { ConfirmedEmailGuard } from '@registration/guards/confirmed-email.guard';
import { UserRegistrationStore } from '@registration/store/user-registration.store';
import { CountryServiceStub } from '@registration/testing/country-service-stub';
import { PhoneNumberPipe } from '@shared/pipes';

describe('ConfirmedEmailGuard', () => {
  let guard: ConfirmedEmailGuard;
  let store: UserRegistrationStore;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CountryService, useClass: CountryServiceStub },
        UserRegistrationStore,
        PhoneNumberPipe,
      ],
    });
    guard = TestBed.inject(ConfirmedEmailGuard);
    store = TestBed.inject(UserRegistrationStore);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should not allow access if the token is not in store', () => {
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    store.setState({ token: null });

    let response = guard.canActivate();
    expect(response).toBeFalsy();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');

    navigateByUrlSpy.mockReset();
    store.setState({ token: '123' });
    response = guard.canActivate();
    expect(response).toBeTruthy();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
