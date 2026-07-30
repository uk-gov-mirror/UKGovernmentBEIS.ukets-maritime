import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { mockClass } from '@netz/common/testing';

import { KeycloakEventType } from '@core/interfaces';
import { AuthService, KeycloakService } from '@core/services';
import { TimeoutBannerService } from '@timeout/timeout-banner/timeout-banner.service';
import { Mocked } from 'vitest';

describe('TimeoutBannerService', () => {
  let service: TimeoutBannerService;
  let keycloakService: Mocked<KeycloakService>;
  let authService: Mocked<AuthService>;

  const futureExp = Math.floor(Date.now() / 1000) + 210;
  const mockRefreshTokenParsed = { iat: Math.floor(Date.now() / 1000) - 100, exp: futureExp };

  beforeEach(() => {
    const keycloakServiceMock = mockClass(KeycloakService);
    const authServiceMock = mockClass(AuthService);

    TestBed.configureTestingModule({
      providers: [
        { provide: KeycloakService, useValue: keycloakServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        TimeoutBannerService,
      ],
    });

    keycloakService = TestBed.inject(KeycloakService) as Mocked<KeycloakService>;
    authService = TestBed.inject(AuthService) as Mocked<AuthService>;
    service = TestBed.inject(TimeoutBannerService);

    (keycloakService.keycloakEvents as any) = signal(null);
    (keycloakService.updateToken as any) = vi.fn().mockResolvedValue(true);
    Object.defineProperty(keycloakService, 'refreshTokenParsed', {
      get: () => mockRefreshTokenParsed,
      configurable: true,
    });
    Object.defineProperty(keycloakService, 'isAuthenticated', {
      get: () => true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with correct values', () => {
    expect(service.isVisible()).toBeFalsy();
    expect(service.timeExtensionAllowed()).toBeTruthy();
  });

  it('should extend session', async () => {
    await service.extendSession();
    expect(keycloakService.updateToken).toHaveBeenCalledWith(-1);
  });

  it('should hide banner when extending session', async () => {
    service.isVisible.set(true);
    await service.extendSession();
    expect(service.isVisible()).toBeFalsy();
  });

  it('should sign out and hide banner', () => {
    service.isVisible.set(true);
    service.signOut();
    expect(service.isVisible()).toBeFalsy();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should handle auth events', () => {
    (keycloakService.keycloakEvents as any).set({
      type: KeycloakEventType.OnAuthRefreshSuccess,
    });
    expect(service['countDownTime']()).toBeGreaterThanOrEqual(0);
  });

  it('should cleanup on destroy', () => {
    vi.useFakeTimers();
    (keycloakService.keycloakEvents as any).set({
      type: KeycloakEventType.OnAuthRefreshSuccess,
    });
    service.ngOnDestroy();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
});
