// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { KeycloakConfig, KeycloakInitOptions } from 'keycloak-js';

// Add here your keycloak setup infos
const keycloakConfig: KeycloakConfig = {
  realm: 'uk-pmrv',
  clientId: 'uk-mrtm-web-app',
};

const keycloakInitOptions: KeycloakInitOptions = {
  onLoad: 'check-sso',
  enableLogging: true,
  pkceMethod: 'S256',
};

const apiOptions = {
  baseUrl: '//localhost:8085/api',
};

const timeoutBanner = {
  timeOffsetSeconds: 120,
};

export const environment = {
  production: false,
  keycloakConfig,
  keycloakInitOptions,
  apiOptions,
  timeoutBanner,
  supportMETSEmail: 'ukets-mets-test@energysecurity.gov.uk',
};
