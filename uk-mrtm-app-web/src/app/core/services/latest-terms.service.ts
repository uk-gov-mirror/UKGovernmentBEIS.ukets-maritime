import { inject, Service } from '@angular/core';

import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';

import { TermsAndConditionsService, TermsDTO } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';

import { selectIsFeatureEnabled } from '@core/config/config.selectors';
import { ConfigStore } from '@core/config/config.store';
import { LatestTermsStore } from '@core/store/latest-terms/latest-terms.store';

@Service()
export class LatestTermsService {
  private readonly latestTermsStore = inject(LatestTermsStore);
  private readonly configStore = inject(ConfigStore);
  private readonly authStore = inject(AuthStore);
  private readonly termsAndConditionsService = inject(TermsAndConditionsService);

  initLatestTerms(): Observable<TermsDTO> {
    return combineLatest([this.configStore.pipe(selectIsFeatureEnabled('terms')), of(this.authStore.state)]).pipe(
      switchMap(([termsEnabled, authState]) =>
        termsEnabled && authState.isLoggedIn ? this.termsAndConditionsService.getLatestTerms() : of(null),
      ),
      tap((latestTerms) => this.latestTermsStore.setLatestTerms(latestTerms)),
      map(() => this.latestTermsStore.getState()),
    );
  }
}
