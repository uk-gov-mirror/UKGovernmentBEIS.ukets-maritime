import { Service, signal } from '@angular/core';

import Keycloak, {
  type KeycloakConfig,
  type KeycloakInitOptions,
  type KeycloakLoginOptions,
  type KeycloakProfile,
  type KeycloakTokenParsed,
} from 'keycloak-js';

import { KeycloakEvent, KeycloakEventType } from '@core/interfaces';

@Service()
export class KeycloakService {
  private keycloak: Keycloak | undefined;

  readonly keycloakEvents = signal<KeycloakEvent | null>(null);

  get keycloakInstance(): Keycloak | undefined {
    return this.keycloak;
  }

  get isAuthenticated(): boolean {
    return this.keycloak?.authenticated;
  }

  get token(): string | undefined {
    return this.keycloak?.token;
  }

  get userProfile(): KeycloakProfile | undefined {
    return this.keycloak?.profile;
  }

  get tokenParsed(): KeycloakTokenParsed {
    return this.keycloak?.tokenParsed;
  }

  get refreshTokenParsed(): KeycloakTokenParsed {
    return this.keycloak?.refreshTokenParsed;
  }

  init(config: KeycloakConfig & KeycloakInitOptions): Promise<boolean> {
    const { realm, clientId, url, ...initOptions } = config;

    const keycloakConfig: KeycloakConfig = {
      url,
      realm,
      clientId,
    };

    this.keycloak = new Keycloak(keycloakConfig);

    return new Promise((resolve, reject) => {
      this.keycloak
        .init(initOptions)
        .then((authenticated) => {
          this.setupEventListeners();
          resolve(authenticated);
        })
        .catch((error) => {
          console.error('Keycloak initialization failed', error);
          reject(error);
        });
    });
  }

  private setupEventListeners(): void {
    if (!this.keycloak) return;

    this.keycloak.onAuthSuccess = () => {
      this.keycloakEvents.set({ type: KeycloakEventType.OnAuthSuccess });
    };

    this.keycloak.onAuthRefreshSuccess = () => {
      this.keycloakEvents.set({ type: KeycloakEventType.OnAuthRefreshSuccess });
    };

    this.keycloak.onAuthRefreshError = () => {
      this.keycloakEvents.set({ type: KeycloakEventType.OnAuthRefreshError });
    };

    this.keycloak.onAuthLogout = () => {
      this.keycloakEvents.set({ type: KeycloakEventType.OnAuthLogout });
    };

    this.keycloak.onTokenExpired = () => {
      this.keycloakEvents.set({ type: KeycloakEventType.OnTokenExpired });
    };

    this.keycloak.onReady = () => {
      this.keycloakEvents.set({ type: KeycloakEventType.OnReady });
    };

    this.keycloak.onActionUpdate = () => {
      this.keycloakEvents.set({ type: KeycloakEventType.OnActionUpdate });
    };
  }

  updateToken(minValidity?: number): Promise<boolean> {
    if (!this.keycloak) {
      return Promise.reject('Keycloak not initialized');
    }
    return this.keycloak.updateToken(minValidity ?? 60);
  }

  login(options?: KeycloakLoginOptions): Promise<void> {
    if (!this.keycloak) {
      return Promise.reject('Keycloak not initialized');
    }
    return this.keycloak.login(options);
  }

  logout(redirectUri?: string): Promise<void> {
    if (!this.keycloak) {
      return Promise.reject('Keycloak not initialized');
    }
    return this.keycloak.logout({ redirectUri });
  }

  loadUserProfile(): Promise<KeycloakProfile> {
    if (!this.keycloak) {
      return Promise.reject('Keycloak not initialized');
    }
    return this.keycloak.loadUserProfile();
  }

  isTokenExpired(minValidity?: number): boolean {
    if (!this.keycloak) {
      return true;
    }
    return this.keycloak.isTokenExpired(minValidity);
  }
}
