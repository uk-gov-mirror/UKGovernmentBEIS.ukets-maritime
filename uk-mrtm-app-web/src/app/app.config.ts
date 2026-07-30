import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  NavigationError,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withNavigationErrorHandler,
  withRouterConfig,
} from '@angular/router';

import { firstValueFrom } from 'rxjs';
import { KeycloakConfig } from 'keycloak-js';

import { ApiModule, Configuration } from '@mrtm/api';

import { ConfigService } from '@core/config';
import { httpErrorInterceptor, keycloakBearerInterceptor, pendingRequestInterceptor } from '@core/interceptors';
import { AuthService, GlobalErrorHandlingService, KeycloakService, LatestTermsService } from '@core/services';
import { isChunkLoadError, reloadForStaleChunk } from '@core/util';
import { environment } from '@environments/environment';

import { APP_ROUTES, routerOptions } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_BASE_HREF,
      useFactory: (pl: PlatformLocation) => pl.getBaseHrefFromDOM(),
      deps: [PlatformLocation],
    },
    provideHttpClient(withInterceptors([keycloakBearerInterceptor, httpErrorInterceptor, pendingRequestInterceptor])),
    provideZonelessChangeDetection(),
    provideAppInitializer(() => {
      const initializerFn = init(
        inject(AuthService),
        inject(ConfigService),
        inject(KeycloakService),
        inject(LatestTermsService),
      );
      return initializerFn();
    }),
    importProvidersFrom(ApiModule.forRoot(() => new Configuration({ basePath: environment.apiOptions.baseUrl }))),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlingService,
    },
    Title,
    provideRouter(
      APP_ROUTES,
      withRouterConfig(routerOptions),
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // During a rolling deployment a lazy route may reference a chunk hash that the freshly-rolled-out
      // pods no longer serve. Reload to the attempted URL to pull the new index.html and recover,
      // instead of letting the failure fall through to the generic /error/500 page.
      withNavigationErrorHandler((event: NavigationError) => {
        if (isChunkLoadError(event.error)) {
          reloadForStaleChunk();
        }
      }),
    ),
  ],
};

function init(
  authService: AuthService,
  configService: ConfigService,
  keycloakService: KeycloakService,
  latestTermsService: LatestTermsService,
) {
  return () =>
    firstValueFrom(configService.initConfigState())
      .then((state) => {
        const keycloakConfig: KeycloakConfig = {
          ...environment.keycloakConfig,
          ...environment.keycloakInitOptions,
          url: state.keycloakServerUrl,
        };
        return keycloakService.init(keycloakConfig);
      })
      .catch((error) => console.error(error))
      .then(() => firstValueFrom(authService.checkUser()))
      .then(() => firstValueFrom(latestTermsService.initLatestTerms()))
      .catch((error) => console.error('[APP_INITIALIZE] init Keycloak failed', error));
}
