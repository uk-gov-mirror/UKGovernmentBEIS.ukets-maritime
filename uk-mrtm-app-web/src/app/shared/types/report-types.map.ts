import { MrtmRequestType } from '@shared/types';

export const reportTypesMap: Record<MrtmRequestType, string> = {
  // Values must be in alphabetical order
  AER: 'Annual emissions',
  DOE: 'Determination of emissions',
  VIR: 'Verifier improvement',
  SITE_VISIT: 'Virtual site visit',
};
