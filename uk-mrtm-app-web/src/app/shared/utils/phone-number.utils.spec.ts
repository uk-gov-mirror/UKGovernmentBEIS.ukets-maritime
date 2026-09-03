import { getRegionCodeForCallingCode } from '@shared/utils';

describe('getRegionCodeForCallingCode', () => {
  it('should resolve a calling code to its region', () => {
    expect(getRegionCodeForCallingCode(44)).toBe('GB');
    expect(getRegionCodeForCallingCode(30)).toBe('GR');
  });

  it('should accept the calling code as a string', () => {
    expect(getRegionCodeForCallingCode('44')).toBe('GB');
  });

  it('should resolve shared calling codes to their main region', () => {
    expect(getRegionCodeForCallingCode(1)).toBe('US');
    expect(getRegionCodeForCallingCode(7)).toBe('RU');
  });

  it('should return undefined for an unknown calling code', () => {
    expect(getRegionCodeForCallingCode(12)).toBeUndefined();
    expect(getRegionCodeForCallingCode(999)).toBeUndefined();
  });
});
