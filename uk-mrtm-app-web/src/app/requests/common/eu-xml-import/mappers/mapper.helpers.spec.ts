import { clampEF, classifyFuel, truncate, warn } from '@requests/common/eu-xml-import/mappers/mapper.helpers';
import { XmlValidationError } from '@shared/types';

describe('classifyFuel', () => {
  it('uses the given fuelOriginCode and fuelTypeCode directly, uppercased', () => {
    expect(classifyFuel('hfo', 'fossil')).toEqual({ origin: 'FOSSIL', type: 'HFO', name: undefined });
  });

  it('accepts BIOFUEL and RFNBO as valid origins too', () => {
    expect(classifyFuel('bio_diesel', 'biofuel')).toEqual({ origin: 'BIOFUEL', type: 'BIO_DIESEL', name: undefined });
    expect(classifyFuel('e_methanol', 'rfnbo')).toEqual({ origin: 'RFNBO', type: 'E_METHANOL', name: undefined });
  });

  it('sets name from otherFuelType when fuelTypeCode is OTHER', () => {
    expect(classifyFuel('other', 'fossil', 'Some custom fuel')).toEqual({
      origin: 'FOSSIL',
      type: 'OTHER',
      name: 'Some custom fuel',
    });
  });

  it('returns undefined for OTHER when no otherFuelType is given — the name is required', () => {
    expect(classifyFuel('other', 'fossil')).toBeUndefined();
    expect(classifyFuel('other', 'fossil', '   ')).toBeUndefined();
  });

  it('returns undefined for OTHER when otherFuelType exceeds 30 characters', () => {
    expect(classifyFuel('other', 'fossil', 'A'.repeat(31))).toBeUndefined();
    expect(classifyFuel('other', 'fossil', 'A'.repeat(30))).toEqual({
      origin: 'FOSSIL',
      type: 'OTHER',
      name: 'A'.repeat(30),
    });
  });

  it('returns undefined for OTHER when the name already exists (case-insensitive) for the same origin', () => {
    const existingOtherFuelNames = [
      { origin: 'FOSSIL', name: 'Custom Fuel' },
      { origin: 'BIOFUEL', name: 'Other origin, same name' },
    ];

    expect(classifyFuel('other', 'fossil', 'custom fuel', existingOtherFuelNames)).toBeUndefined();
    // Same name but a different origin is not a duplicate.
    expect(
      classifyFuel('other', 'biofuel', 'Other origin, same name', [{ origin: 'FOSSIL', name: 'Custom Fuel' }]),
    ).toEqual({ origin: 'BIOFUEL', type: 'OTHER', name: 'Other origin, same name' });
  });

  it('returns undefined when fuelOriginCode is not FOSSIL, BIOFUEL or RFNBO', () => {
    expect(classifyFuel('hfo', 'not-a-real-origin')).toBeUndefined();
  });

  it('returns undefined when fuelOriginCode is missing entirely', () => {
    expect(classifyFuel('hfo')).toBeUndefined();
  });
});

describe('clampEF', () => {
  it('returns the value unchanged when positive', () => {
    const warnings: XmlValidationError[] = [];
    expect(clampEF(3.5, 'context', warnings)).toBe(3.5);
    expect(warnings).toEqual([]);
  });

  it('drops negative values to undefined and warns', () => {
    const warnings: XmlValidationError[] = [];
    expect(clampEF(-1, 'context', warnings)).toBeUndefined();
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toContain('negative');
  });

  it('also drops zero to undefined and warns', () => {
    const warnings: XmlValidationError[] = [];
    expect(clampEF(0, 'context', warnings)).toBeUndefined();
    expect(warnings).toHaveLength(1);
  });
});

describe('truncate', () => {
  it('returns an empty string for falsy input', () => {
    const warnings: XmlValidationError[] = [];
    expect(truncate('', 10, 'context', warnings)).toBe('');
    expect(warnings).toEqual([]);
  });

  it('returns the value unchanged when within the limit', () => {
    const warnings: XmlValidationError[] = [];
    expect(truncate('short', 10, 'context', warnings)).toBe('short');
    expect(warnings).toEqual([]);
  });

  it('truncates and warns when the value exceeds the limit', () => {
    const warnings: XmlValidationError[] = [];
    expect(truncate('this is too long', 5, 'context', warnings)).toBe('this ');
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toContain('truncated');
  });
});

describe('warn', () => {
  it('builds an XmlValidationError with no row/column by default', () => {
    expect(warn('something went wrong')).toEqual({ row: null, column: null, message: 'something went wrong' });
  });

  it('builds an XmlValidationError with the given column when provided', () => {
    expect(warn('something went wrong', 'imoNumber')).toEqual({
      row: null,
      column: 'imoNumber',
      message: 'something went wrong',
    });
  });
});
