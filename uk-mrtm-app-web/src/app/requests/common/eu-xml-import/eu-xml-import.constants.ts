import { FlagEnum } from '@requests/common/types';

export const EU_XML_IMPORT_ROUTE_PREFIX = 'eu-xml-import';

export const VALID_FUEL_ORIGINS = new Set(['FOSSIL', 'BIOFUEL', 'RFNBO']);

export const VALID_SOURCE_TYPES = new Set([
  'MAIN_ENGINE',
  'AUX_ENGINE',
  'GAS_TURBINE',
  'BOILER',
  'INERT_GAS_GENERATOR',
  'FUEL_CELLS',
  'WASTE_INCINERATOR',
  'OTHER',
]);
export const VALID_SOURCE_CLASSES = new Set([
  'BOILERS',
  'FUEL_CELLS',
  'GAS_TURBINE',
  'ICE',
  'INERT_GAS_GENERATOR',
  'LNG_DIESEL_DFSS',
  'LNG_LBSI',
  'LNG_OTTO_DFMS',
  'LNG_OTTO_DFSS',
  'WASTE_INCINERATORS',
]);
export const VALID_MONITORING_METHODS = new Set(['BDN', 'BUNKER_TANK', 'FLOW_METERS', 'DIRECT']);
export const VALID_ICE_CLASSES = new Set([
  'PC1',
  'PC2',
  'PC3',
  'PC4',
  'PC5',
  'PC6',
  'PC7',
  'IC',
  'IB',
  'IA',
  'IA_SUPER',
]);
export const VALID_SHIP_TYPES = new Set([
  'PAX',
  'RORO',
  'CONT',
  'OIL',
  'CHEM',
  'LNG',
  'GAS',
  'BULK',
  'GENERAL',
  'RCV',
  'VEH',
  'COMB',
  'ROPAX',
  'CONT_RORO',
  'CRUISE',
  'OFFSHORE',
  'OTHER',
]);
export const VALID_BUNKER_METHODS = new Set(['ON_BOARD_MEASUREMENT_SYSTEMS', 'FUEL_SUPPLIER', 'LABORATORY_TEST']);
export const VALID_FLAGS = new Set<string>(Object.values(FlagEnum));

export const PROC_REFERENCE_MAX = 250;
export const PROC_VERSION_MAX = 250;
export const PROC_DESCRIPTION_MAX = 10000;
export const PROC_RESPONSIBLE_MAX = 250;
export const PROC_LOCATION_MAX = 250;
export const PROC_IT_MAX = 250;

export const ABBREV_MAX = 30;
export const DEFINITION_MAX = 255;

export const OTHER_FUEL_NAME_MAX = 30;

export const SHIP_NAME_MAX = 255;
export const SOURCE_NAME_MAX = 255;
export const SOURCE_REF_MAX = 30;
export const MEASUREMENT_NAME_MAX = 250;
export const MEASUREMENT_DESC_MAX = 10000;
export const CARBON_CAPTURE_DESC_MAX = 10000;

export const OPERATOR_NAME_MAX = 256;
export const ADDRESS_LINE_MAX = 256;
export const ADDRESS_CITY_MAX = 256;
export const ADDRESS_COUNTRY_MAX = 256;
