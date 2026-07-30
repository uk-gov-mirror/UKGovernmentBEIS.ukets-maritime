export enum KeycloakEventType {
  OnAuthSuccess = 'onAuthSuccess',
  OnAuthRefreshSuccess = 'onAuthRefreshSuccess',
  OnAuthRefreshError = 'onAuthRefreshError',
  OnAuthLogout = 'onAuthLogout',
  OnActionUpdate = 'onActionUpdate',
  OnTokenExpired = 'onTokenExpired',
  OnReady = 'onReady',
}

export interface KeycloakEvent {
  type: KeycloakEventType;
}
