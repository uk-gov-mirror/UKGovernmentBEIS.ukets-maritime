import type { CountryCode } from 'libphonenumber-js';
import metadata from 'libphonenumber-js/metadata.max.json';

/**
 * Resolves the region of a country calling code, e.g. `44` to `GB`.
 *
 * Calling codes shared between several regions list the main one first, so `1`
 * resolves to `US` rather than to any of the other North American regions.
 * Returns `undefined` when the calling code is unknown.
 */
export const getRegionCodeForCallingCode = (callingCode: string | number): CountryCode | undefined => {
  return metadata.country_calling_codes[String(callingCode)]?.[0];
};
