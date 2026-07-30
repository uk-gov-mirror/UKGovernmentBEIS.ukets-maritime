import { signal } from '@angular/core';

import { AuthoritiesService, TermsAndConditionsService, UsersService } from '@mrtm/api';

import { AuthService, KeycloakService } from '@core/services';
import { Mock } from 'vitest';

export const mockKeycloakService: Record<keyof KeycloakService, any> = {
  login: vi.fn(),
  logout: vi.fn(),
  isLoggedIn: vi.fn(),
  loadUserProfile: vi.fn(),
  init: vi.fn(),
  getKeycloakInstance: vi.fn(),
  getToken: vi.fn(),
  updateToken: vi.fn(),
  getUserProfile: vi.fn(),
  isTokenExpired: vi.fn(),
  getTokenParsed: vi.fn(),
  getRefreshTokenParsed: vi.fn(),
  keycloakEvents: signal(null),
} as any;

export const mockAuthService: Partial<Record<keyof AuthService, Mock>> = {
  checkUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  loadUser: vi.fn(),
  loadUserState: vi.fn(),
  loadUserProfile: vi.fn(),
  loadUserTerms: vi.fn(),
  loadIsLoggedIn: vi.fn(),
};

export const mockUsersService: Partial<Record<keyof UsersService, Mock>> = {
  getCurrentUser: vi.fn(),
};

export const mockAuthorityService: Partial<Record<keyof AuthoritiesService, Mock>> = {
  getCurrentUserState: vi.fn(),
};

export const mockTermsAndConditionsService: Partial<Record<keyof TermsAndConditionsService, Mock>> = {
  getLatestTerms: vi.fn(),
};
