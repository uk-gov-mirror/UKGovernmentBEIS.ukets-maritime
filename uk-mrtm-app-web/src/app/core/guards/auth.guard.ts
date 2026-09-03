import { inject, Service } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { combineLatest, first, map, Observable, of, switchMap } from 'rxjs';

import { AuthStore } from '@netz/common/auth';

import { selectIsFeatureEnabled } from '@core/config/config.selectors';
import { ConfigStore } from '@core/config/config.store';
import { AuthService } from '@core/services/auth.service';
import { LatestTermsStore } from '@core/store/latest-terms/latest-terms.store';
import { loginDisabled } from '@core/util/user-status-util';

@Service()
export class AuthGuard implements CanActivate {
  protected router = inject(Router);
  protected authService = inject(AuthService);
  private store = inject(AuthStore);
  private latestTermsStore = inject(LatestTermsStore);
  private configStore = inject(ConfigStore);

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.checkUser().pipe(
      switchMap(() =>
        combineLatest([
          of(this.store.state),
          this.configStore.pipe(selectIsFeatureEnabled('terms')),
          this.latestTermsStore,
        ]),
      ),
      map(([{ isLoggedIn, userState, userTerms }, termsEnabled, latestTerms]) =>
        isLoggedIn && (!termsEnabled || latestTerms.version === userTerms.termsVersion) && !loginDisabled(userState)
          ? (true as const)
          : isLoggedIn && termsEnabled && latestTerms.version !== userTerms.termsVersion
            ? this.router.parseUrl('/terms')
            : this.router.parseUrl('landing'),
      ),
      first(),
    );
  }
}
