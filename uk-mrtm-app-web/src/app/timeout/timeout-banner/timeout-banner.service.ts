import { computed, effect, inject, Injectable, OnDestroy, signal } from '@angular/core';

import { KeycloakEventType } from '@core/interfaces';
import { AuthService, KeycloakService } from '@core/services';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class TimeoutBannerService implements OnDestroy {
  private readonly keycloak = inject(KeycloakService);
  private readonly authService = inject(AuthService);

  private readonly initialRefreshTokenExpOffset = signal<number | undefined>(undefined);
  readonly isVisible = signal(false);
  readonly timeExtensionAllowed = signal(true);

  // Derive state reactively from the keycloak signal and auth events
  private readonly refreshTokenParsed = computed(() => {
    this.keycloak.keycloakEvents(); // Track events to re-evaluate when token changes

    return this.keycloak.refreshTokenParsed;
  });
  private readonly refreshTokenParsedExp = computed(() => this.refreshTokenParsed()?.exp);
  private readonly refreshTokenParsedIat = computed(() => this.refreshTokenParsed()?.iat);
  readonly hasValidToken = computed(
    () => this.refreshTokenParsedExp() !== undefined && this.refreshTokenParsedIat() !== undefined,
  );
  private readonly refreshTokenExpOffset = computed(() => {
    const exp = this.refreshTokenParsedExp();
    const iat = this.refreshTokenParsedIat();
    return exp !== undefined && iat !== undefined ? exp - iat : 0;
  });
  // Compute how many milliseconds to wait before showing the banner
  private readonly countDownTime = computed(() => {
    if (!this.hasValidToken()) return 0;

    const expiryMs = (this.refreshTokenParsedExp() ?? 0) * 1000;
    const msUntilExpiry = expiryMs - Date.now();
    const msOffset = this.timeOffsetSeconds * 1000;

    return Math.max(0, msUntilExpiry - msOffset);
  });

  private countdownTimeout: ReturnType<typeof setTimeout> | null = null;
  private bannerTimeout: ReturnType<typeof setTimeout> | null = null;
  private scheduledExpiryTime: number | null = null;
  readonly timeOffsetSeconds = environment.timeoutBanner.timeOffsetSeconds;

  constructor() {
    // Handle Authentication Events
    effect(() => {
      const event = this.keycloak.keycloakEvents();
      if (!event) return;

      switch (event.type) {
        case KeycloakEventType.OnAuthRefreshSuccess:
          this.handleRefreshSuccess();
          break;
        case KeycloakEventType.OnAuthLogout:
          this.idleLogout();
          break;
      }
    });

    // Manage Banner Visibility Lifecycle
    effect(() => {
      const countDown = this.countDownTime();
      const currentExpiry = this.refreshTokenParsedExp();
      const visible = this.isVisible();

      // Avoid rescheduling if banner is already up
      if (visible || countDown <= 0 || !this.hasValidToken()) {
        return;
      }

      // Optimization: Only reschedule if the expiry time changed significantly (> 60s)
      if (this.scheduledExpiryTime !== null) {
        const expiryDiff = Math.abs((currentExpiry ?? 0) - this.scheduledExpiryTime);
        if (expiryDiff < 60) return;
      }

      this.clearTimeouts();
      this.scheduledExpiryTime = currentExpiry ?? null;

      this.countdownTimeout = setTimeout(() => {
        this.isVisible.set(true);
      }, countDown);
    });

    // Handle Automatic Logout when Banner is shown
    effect(() => {
      if (!this.isVisible()) {
        if (this.bannerTimeout) {
          clearTimeout(this.bannerTimeout);
          this.bannerTimeout = null;
        }
        return;
      }

      // When banner becomes visible, start the final countdown to logout
      this.bannerTimeout = setTimeout(() => {
        this.idleLogout();
      }, this.timeOffsetSeconds * 1000);
    });
  }

  private handleRefreshSuccess() {
    const offset = this.refreshTokenExpOffset();
    const initial = this.initialRefreshTokenExpOffset();

    if (initial === undefined) {
      if (this.hasValidToken()) {
        this.initialRefreshTokenExpOffset.set(offset);
      }
    } else if (offset < initial) {
      // If the new refresh token lifetime is shorter than initial, extension might no longer be possible
      this.timeExtensionAllowed.set(false);
    }
  }

  extendSession(): void {
    if (this.keycloak.isAuthenticated) {
      this.keycloak
        .updateToken(-1)
        .then(() => {
          this.clearTimeouts();
        })
        .catch(() => {
          this.clearTimeouts();
          this.authService.logout(`timed-out?idle=NaN`);
        });
    }
  }

  signOut(): void {
    this.clearTimeouts();
    this.authService.logout();
  }

  private idleLogout(): void {
    const idleTime = (this.refreshTokenParsedExp() ?? 0) - (this.refreshTokenParsedIat() ?? 0);
    this.clearTimeouts();
    this.authService.logout(`timed-out?idle=${idleTime}`);
  }

  private clearTimeouts(): void {
    if (this.countdownTimeout) {
      clearTimeout(this.countdownTimeout);
      this.countdownTimeout = null;
    }
    if (this.bannerTimeout) {
      clearTimeout(this.bannerTimeout);
      this.bannerTimeout = null;
    }
    this.scheduledExpiryTime = null;
    this.isVisible.set(false);
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }
}
