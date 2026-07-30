import { FuelOriginTypeName } from '@mrtm/api';

import { OTHER_FUEL_NAME_MAX, VALID_FUEL_ORIGINS } from '@requests/common/eu-xml-import/eu-xml-import.constants';
import { FUEL_TYPES_BY_ORIGIN } from '@shared/constants';
import { XmlValidationError } from '@shared/types';

export function classifyFuel(
  fuelTypeCode: string,
  fuelOriginCode?: string,
  otherFuelType?: string,
  existingOtherFuelNames?: Array<{ origin: string; name?: string }>,
):
  | {
      origin: FuelOriginTypeName['origin'];
      type: string;
      name?: string;
    }
  | undefined {
  const origin = fuelOriginCode?.toUpperCase();
  if (!VALID_FUEL_ORIGINS.has(origin)) {
    return undefined;
  }

  const type = fuelTypeCode?.toUpperCase() ?? '';
  if (type !== 'OTHER') {
    const types = FUEL_TYPES_BY_ORIGIN[origin]?.map((t) => t.value);
    if (!types.includes(type)) {
      return undefined;
    }
    return { origin: origin as FuelOriginTypeName['origin'], type, name: undefined };
  }

  const name = otherFuelType?.trim();
  if (!name || name.length > OTHER_FUEL_NAME_MAX) {
    return undefined;
  }

  const isDuplicate = existingOtherFuelNames?.some(
    (existing) => existing.origin === origin && existing.name?.toUpperCase() === name.toUpperCase(),
  );
  if (isDuplicate) {
    return undefined;
  }

  return { origin: origin as FuelOriginTypeName['origin'], type, name };
}

export function clampEF(value: number, context: string, warnings: XmlValidationError[]): number {
  if (value <= 0) {
    warnings.push(
      warn(`${context}: emission factor ${value} is negative or zero and will need to be entered manually.`),
    );
    return undefined;
  }
  return value;
}

export function truncate(value: string, maxLength: number, context: string, warnings: XmlValidationError[]): string {
  if (!value) return '';
  if (value.length > maxLength) {
    warnings.push(warn(`${context}: value truncated from ${value.length} to ${maxLength} characters.`));
    return value.slice(0, maxLength);
  }
  return value;
}

export function warn(message: string, column: string | null = null): XmlValidationError {
  return { row: null, column, message };
}
