import { Service } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Service()
export class CookiesService {
  private PREFERENCES_SET_COOKIE = 'uk_pmrv_cookies_preferences_set';
  private COOKIES_POLICY = 'uk_pmrv_cookies_policy';
  accepted$ = new BehaviorSubject(this.accepted());

  rejectAllCookies(cookiesExpirationTime: number) {
    const result = this.processCookie(false, cookiesExpirationTime);
    this.accepted$.next(true);
    return result;
  }

  acceptAllCookies(cookiesExpirationTime: number) {
    const result = this.processCookie(true, cookiesExpirationTime);
    this.accepted$.next(true);
    return result;
  }

  private processCookie(accepted: boolean, cookiesExpirationTime: number) {
    if (!this.cookiesEnabled()) {
      return;
    }
    const d = new Date();
    d.setTime(d.getTime() + Number(cookiesExpirationTime) * 24 * 60 * 60 * 1000); // Valid for 1 year
    this.setCookie(this.PREFERENCES_SET_COOKIE, 'true', {
      // secure: true,
      expires: d,
    });
    this.setCookie(
      this.COOKIES_POLICY,
      JSON.stringify({
        essential: accepted,
        usage: accepted,
      }),
      {
        // secure: true,
        expires: d,
      },
    );
    return true;
  }

  accepted() {
    return !!this.getCookie(this.PREFERENCES_SET_COOKIE);
  }
  /**
   * Get the value of a specific Cookie if exists
   * @param name The name of the Cookie
   */

  getCookie(name) {
    const cookieName = name + '=';
    const cookieValue = document.cookie.split(';');
    for (const cookie of cookieValue) {
      let c = cookie;
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(cookieName) === 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return null;
  }

  /**
   * Check if the Browser has the Cookies enabled.
   */
  cookiesEnabled() {
    return navigator.cookieEnabled;
  }

  setCookie(name, value, options) {
    const cookieOptions = {
      path: '/',
      ...options,
    };

    if (cookieOptions.expires instanceof Date) {
      cookieOptions.expires = cookieOptions.expires.toUTCString();
    }

    let updatedCookie = name + '=' + value;

    Object.keys(cookieOptions).forEach((option) => {
      updatedCookie += '; ' + option;
      const optionValue = cookieOptions[option];
      if (optionValue !== true) {
        updatedCookie += '=' + optionValue;
      }
    });
    document.cookie = updatedCookie;
  }

  hasAnalyticsConsent(): boolean {
    const cookieStr = this.getCookie(this.COOKIES_POLICY);
    if (!cookieStr) {
      return false;
    }

    return JSON.parse(cookieStr).usage;
  }
}
