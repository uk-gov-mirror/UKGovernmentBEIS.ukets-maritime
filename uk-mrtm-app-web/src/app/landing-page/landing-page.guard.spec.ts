import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';

import { firstValueFrom, Observable, of } from 'rxjs';

import { AuthStore } from '@netz/common/auth';
import { MockType } from '@netz/common/testing';

import { ConfigStore } from '@core/config';
import { AuthService } from '@core/services/auth.service';
import { LatestTermsStore } from '@core/store/latest-terms/latest-terms.store';
import { environment } from '@environments/environment';
import { landingPageGuard } from '@landing-page/landing-page.guard';
import { features } from 'process';

describe('LandingPageGuard', () => {
  const guard = landingPageGuard;
  let router: Router;
  let authStore: AuthStore;
  let latestTermsStore: LatestTermsStore;
  let configStore: ConfigStore;

  const authService: MockType<AuthService> = {
    checkUser: vi.fn(() => of(undefined)),
  };

  const callGuard: () => Observable<boolean | UrlTree> = () => TestBed.runInInjectionContext(() => landingPageGuard());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    });

    authStore = TestBed.inject(AuthStore);
    authStore.setIsLoggedIn(true);
    authStore.setUserState({ status: 'ENABLED', roleType: 'OPERATOR' });
    authStore.setUser({ email: 'asd@asd.com', firstName: 'Darth', lastName: 'Vader' });
    authStore.setUserTerms({ termsVersion: 1 });

    latestTermsStore = TestBed.inject(LatestTermsStore);
    latestTermsStore.setLatestTerms({ version: 1, url: 'asd' });

    configStore = TestBed.inject(ConfigStore);
    configStore.setState({ features: { terms: true } });

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow if user is not logged in and not in prod mode', () => {
    authStore.setIsLoggedIn(false);
    environment.production = false;
    return expect(firstValueFrom(callGuard())).resolves.toEqual(true);
  });

  it('should allow if user has no role type', () => {
    authStore.setUserState({ roleType: null });
    return expect(firstValueFrom(callGuard())).resolves.toEqual(true);
  });

  it('should allow if user is logged in and terms match and status is not ENABLED', () => {
    authStore.setUserState({ status: 'DISABLED' });
    return expect(firstValueFrom(callGuard())).resolves.toEqual(true);
  });

  it('should allow if user is logged in and no authority', () => {
    authStore.setIsLoggedIn(true);
    authStore.setUserState({ status: 'NO_AUTHORITY' });
    return expect(firstValueFrom(callGuard())).resolves.toEqual(true);
  });

  it(`should allow when user has login with status 'ACCEPTED' and has accepted the terms`, async () => {
    authStore.setUserState({ status: 'ACCEPTED' });
    await expect(firstValueFrom(callGuard())).resolves.toEqual(true);
  });

  it(`should redirect to terms and conditions when user has login with status 'ACCEPTED' and has not accepted the terms`, async () => {
    authStore.setUserState({ status: 'ACCEPTED', roleType: 'OPERATOR' });
    authStore.setUser({ email: 'asd@asd.com', firstName: 'First', lastName: 'Last' });
    authStore.setUserTerms({ termsVersion: null });
    await expect(firstValueFrom(callGuard())).resolves.toEqual(router.parseUrl('terms'));
  });

  it(`should redirect to dashboard when user is REGULATOR or VERIFIER and has NO_AUTHORITY`, async () => {
    authStore.setUserState({
      roleType: 'REGULATOR',
      status: 'NO_AUTHORITY',
    });
    await expect(firstValueFrom(callGuard())).resolves.toEqual(router.parseUrl('dashboard'));

    authStore.setUserState({ ...authStore.state.userState, roleType: 'VERIFIER' });
    await expect(firstValueFrom(callGuard())).resolves.toEqual(router.parseUrl('dashboard'));

    authStore.setUserState({
      ...authStore.state.userState,
      roleType: 'OPERATOR',
    });
    await expect(firstValueFrom(callGuard())).resolves.toEqual(true);
  });

  it(`should allow when user has login 'DISABLED' or 'TEMP_DISABLED'`, async () => {
    authStore.setUserState({
      roleType: 'VERIFIER',
      status: 'TEMP_DISABLED',
    });

    await expect(firstValueFrom(callGuard())).resolves.toEqual(true);

    authStore.setUserState({
      ...authStore.state.userState,
      roleType: 'OPERATOR',
    });
    await expect(firstValueFrom(callGuard())).resolves.toEqual(true);
  });

  it('should not redirect to terms if terms feature is disabled', async () => {
    configStore.setState({ features: { terms: false } });
    await expect(firstValueFrom(callGuard())).resolves.toEqual(router.parseUrl('dashboard'));
  });

  it(`should redirect to terms when terms feature is enabled and terms differ`, async () => {
    configStore.setState({ features: { terms: true } });
    authStore.setUserTerms({ termsVersion: 1 });
    latestTermsStore.setLatestTerms({ url: 'aa', version: 2 });
    await expect(firstValueFrom(callGuard())).resolves.toEqual(router.parseUrl('terms'));
  });

  it('should allow if user is not logged in and in prod mode and gateway not enabled', () => {
    authStore.setIsLoggedIn(false);
    environment.production = true;
    configStore.setState({ ...configStore.getState(), features: { ...features, serviceGatewayEnabled: false } });
    return expect(firstValueFrom(callGuard())).resolves.toEqual(true);
  });

  it('should redirect to origin url when not logged in and in prod mode and gateway enabled', async () => {
    authStore.setIsLoggedIn(false);
    environment.production = true;
    configStore.setState({ ...configStore.getState(), features: { ...features, serviceGatewayEnabled: true } });
    const result = callGuard();
    await expect(firstValueFrom(result)).resolves.toEqual(false);
    expect(window.location.href).toBe(location.origin + '/');
  });
});
