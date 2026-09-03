import { Pipe, PipeTransform } from '@angular/core';

import { UKCountryCodes } from '@shared/types';
import { getRegionCodeForCallingCode } from '@shared/utils';

@Pipe({
  name: 'phoneNumber',
  standalone: true,
})
export class PhoneNumberPipe implements PipeTransform {
  transform(callingCode: string): string {
    if (callingCode == null) {
      return null;
    }
    // 'ZZ' is shown for calling codes that belong to no known region
    const countryCode: string = getRegionCodeForCallingCode(callingCode) ?? 'ZZ';
    return `${UKCountryCodes.GB === countryCode ? UKCountryCodes.UK : countryCode} (${callingCode})`;
  }
}
