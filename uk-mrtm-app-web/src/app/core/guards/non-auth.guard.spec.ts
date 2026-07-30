import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';

import { lastValueFrom, of } from 'rxjs';

import { AuthStore } from '@netz/common/auth';
import { MockType } from '@netz/common/testing';

import { NonAuthGuard } from '@core/guards/non-auth.guard';
import { AuthService } from '@core/services/auth.service';

describe('NonAuthGuard', () => {
  let guard: NonAuthGuard;
  let router: Router;
  let authStore: AuthStore;

  const authService: MockType<AuthService> = {
    checkUser: vi.fn(() => of(undefined)),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    });

    authStore = TestBed.inject(AuthStore);
    guard = TestBed.inject(NonAuthGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if the user is not logged in', () => {
    authStore.setIsLoggedIn(false);

    return expect(lastValueFrom(TestBed.runInInjectionContext(() => guard.canActivate()))).resolves.toEqual(true);
  });

  it('should redirect to main route if the user is logged in', async () => {
    authStore.setIsLoggedIn(true);
    const navigateSpy = vi.spyOn(router, 'parseUrl').mockReturnValue(new UrlTree());

    await lastValueFrom(TestBed.runInInjectionContext(() => guard.canActivate()));

    expect(navigateSpy).toHaveBeenCalled();
  });
});
