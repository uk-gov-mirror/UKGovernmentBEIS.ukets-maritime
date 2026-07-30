import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { firstValueFrom, of } from 'rxjs';

import { AuthStore } from '@netz/common/auth';
import { MockType } from '@netz/common/testing';

import { ConfigStore } from '@core/config/config.store';
import { AuthGuard } from '@core/guards/auth.guard';
import { AuthService } from '@core/services';
import { LatestTermsStore } from '@core/store/latest-terms/latest-terms.store';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;
  let authStore: AuthStore;
  let latestTermsStore: LatestTermsStore;
  let configStore: ConfigStore;

  const authService: MockType<AuthService> = {
    checkUser: vi.fn(() => of(undefined)),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    authStore = TestBed.inject(AuthStore);

    latestTermsStore = TestBed.inject(LatestTermsStore);

    configStore = TestBed.inject(ConfigStore);
    configStore.setState({ features: { terms: true } });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it("should redirect to terms if user is logged in and terms don't match and terms feature is enabled", async () => {
    authStore.setIsLoggedIn(true);
    authStore.setUserState({ status: 'DISABLED' });
    authStore.setUserTerms({ termsVersion: 1 });
    authStore.setUser({ termsVersion: 1 } as any);

    latestTermsStore.setLatestTerms({ version: 2, url: 'asd' });
    configStore.setState({ features: { terms: true } });

    let res = await firstValueFrom(guard.canActivate());
    expect(res).toEqual(router.parseUrl('terms'));

    authStore.setUserTerms({ termsVersion: 2 });
    res = await firstValueFrom(guard.canActivate());
    expect(res).toEqual(router.parseUrl('landing'));

    authStore.setUserState({ status: 'ENABLED' });
    res = await firstValueFrom(guard.canActivate());
    expect(res).toEqual(true);
  });

  it('should redirect to landing page if user is not logged in or is disabled and terms feature is enabled', async () => {
    authStore.setIsLoggedIn(false);
    configStore.setState({ features: { terms: true } });
    await expect(firstValueFrom(guard.canActivate())).resolves.toEqual(router.parseUrl('landing'));

    authStore.setIsLoggedIn(true);
    authStore.setUserTerms({ termsVersion: 1 });
    authStore.setUserState({ status: 'DISABLED' });

    latestTermsStore.setLatestTerms({ version: 1, url: 'asd' });

    await expect(firstValueFrom(guard.canActivate())).resolves.toEqual(router.parseUrl('landing'));

    authStore.setIsLoggedIn(true);
    authStore.setUserState({ status: 'TEMP_DISABLED' });
    await expect(firstValueFrom(guard.canActivate())).resolves.toEqual(router.parseUrl('landing'));
  });

  it('should allow access if user is logged in and not disabled and terms feature is disabled', async () => {
    authStore.setIsLoggedIn(true);
    authStore.setUserState({ status: 'ACCEPTED' });
    configStore.setState({ features: { terms: false } });
    const result = await firstValueFrom(guard.canActivate());
    expect(result).toEqual(true);
  });
});
