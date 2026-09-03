import { inject, Service } from '@angular/core';

import { map, Observable, tap } from 'rxjs';

import { UIConfigurationService } from '@mrtm/api';

import { selectConfigProperty, selectGtmContainerId, selectIsFeatureEnabled } from '@core/config/config.selectors';
import { ConfigPropertiesName, ConfigState, FeatureName } from '@core/config/config.state';
import { ConfigStore } from '@core/config/config.store';

@Service()
export class ConfigService {
  private readonly store = inject(ConfigStore);
  private readonly configurationService = inject(UIConfigurationService);

  initConfigState(): Observable<ConfigState> {
    return this.configurationService.getUIFlags().pipe(
      tap((props) => this.store.setState({ ...props } as ConfigState)),
      map(() => this.store.getState()),
    );
  }

  isFeatureEnabled(feature: FeatureName): Observable<boolean> {
    return this.store.pipe(selectIsFeatureEnabled(feature));
  }

  getConfigProperty(property: ConfigPropertiesName): Observable<string> {
    return this.store.pipe(selectConfigProperty(property));
  }

  getGtmContainerId(): Observable<string> {
    return this.store.pipe(selectGtmContainerId);
  }
}
