import { inject, Service } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { combineLatest, first, map, Observable, of, switchMap } from 'rxjs';

import { AuthStore } from '@netz/common/auth';

import { ConfigStore, selectIsFeatureEnabled } from '@core/config';
import { AuthService } from '@core/services/auth.service';
import { LatestTermsStore } from '@core/store/latest-terms/latest-terms.store';

@Service()
export class TermsAndConditionsGuard implements CanActivate {
  protected router = inject(Router);
  protected authService = inject(AuthService);
  private authStore = inject(AuthStore);
  private latestTermsStore = inject(LatestTermsStore);
  private configStore = inject(ConfigStore);

  canActivate(_, state: RouterStateSnapshot): Observable<true | UrlTree> {
    return this.authService.checkUser().pipe(
      switchMap(() =>
        combineLatest([
          this.configStore.pipe(selectIsFeatureEnabled('terms')),
          this.latestTermsStore,
          of(this.authStore.state),
        ]),
      ),
      map(([termsEnabled, latestTerms, { userTerms }]) => {
        if (!termsEnabled) {
          return true;
        }

        if (state.url === '/terms') {
          return latestTerms.version !== userTerms.termsVersion || this.router.parseUrl('landing');
        }

        return latestTerms.version === userTerms.termsVersion || this.router.parseUrl('landing');
      }),
      first(),
    );
  }
}
