export const FEATURES = ['terms', 'serviceGatewayEnabled', 'aerCurrentYearSubmitEnabled'] as const;
export type FeatureName = (typeof FEATURES)[number];
export type FeaturesConfig = { [key in FeatureName]?: boolean };

export const CONFIG_PROPERTIES = ['minYearOfFirstMrtmActivity'] as const;
export type ConfigPropertiesName = (typeof CONFIG_PROPERTIES)[number];
export type ConfigProperties = { [key in ConfigPropertiesName]?: string };

export interface ConfigState {
  features?: FeaturesConfig;
  properties?: ConfigProperties;
  analytics?: {
    gtmContainerId: string;
  };
  keycloakServerUrl?: string;
}

export const initialState: ConfigState = {
  features: {},
  properties: {},
  analytics: {
    gtmContainerId: '',
  },
};
