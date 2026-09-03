import { Service } from '@angular/core';

import { getCountryCallingCode, isSupportedCountry } from 'libphonenumber-js/max';

@Service()
export class CountryCallingCodeService {
  getCountryCallingCode(countryCode: string): number {
    return this.handleMissingCodes(countryCode) ?? this.lookUpCallingCode(countryCode);
  }

  private lookUpCallingCode(countryCode: string): number {
    return isSupportedCountry(countryCode) ? Number(getCountryCallingCode(countryCode)) : 0;
  }

  private handleMissingCodes(countryCode: string): number {
    switch (countryCode) {
      case 'GB-ENG':
      case 'GB-NIR':
      case 'GB-SCT':
      case 'GB-WLS': {
        return 44;
      }
      default: {
        return null;
      }
    }
  }
}
