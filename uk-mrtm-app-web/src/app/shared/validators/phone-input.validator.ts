import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { isValidPhoneNumber, validatePhoneNumberLength } from 'libphonenumber-js/max';

import { GovukValidators, MessageValidatorFn } from '@netz/govuk-components';

import { getRegionCodeForCallingCode } from '@shared/utils';

const phoneNumberSizeValidator = (): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: string } | null => {
    return control.value?.number?.length > 255
      ? { invalidSize: `Your phone number should not be larger than 255 characters` }
      : null;
  };
};

const phoneNumberValidatorWithSeparateCountryCodeAndPhoneNumberFields = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    // If the fields are not filled, return null
    if (!control.value?.countryCode || !control.value?.number) {
      return null;
    }

    const countryCode = control.value.countryCode;
    const phone = control.value.number;

    // Regex to check for valid phone number characters
    const phoneNumberRegex = new RegExp('^[\\d \\-()]*$');

    // Check for invalid characters
    const isPhoneNumber = phoneNumberRegex.test(phone);
    if (!isPhoneNumber) {
      return { invalidChars: 'The phone number contains invalid characters' };
    }

    const regionCode = getRegionCodeForCallingCode(countryCode);
    if (!regionCode) {
      return { invalidPhone: 'Your phone number is not valid' };
    }

    if (isValidPhoneNumber(phone, regionCode)) {
      return null;
    }

    switch (validatePhoneNumberLength(phone, regionCode)) {
      case 'TOO_SHORT':
        return { tooShort: 'The phone number is too short for your country code' };
      case 'TOO_LONG':
        return { tooLong: 'The phone number is too long for your country code' };
      case 'INVALID_LENGTH':
        return { invalidLength: 'The phone number length is invalid' };
      default:
        return { invalidPhone: 'Your phone number is not valid' };
    }
  };
};

export const phoneInputWithCountyCodeSelectValidators: MessageValidatorFn[] = [
  GovukValidators.incomplete('Enter both country code and number'),
  phoneNumberSizeValidator(),
  phoneNumberValidatorWithSeparateCountryCodeAndPhoneNumberFields(),
];

export const phoneInputValidators: MessageValidatorFn[] = [phoneNumberSizeValidator()];
