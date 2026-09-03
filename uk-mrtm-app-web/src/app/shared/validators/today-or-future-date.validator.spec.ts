import { FormControl } from '@angular/forms';

import { todayOrFutureDateValidator } from '@shared/validators';

const TIMEZONES = [
  { name: 'behind UTC (America/New_York)', tz: 'America/New_York' },
  { name: 'at UTC (UTC)', tz: 'UTC' },
  { name: 'ahead of UTC (Pacific/Tongatapu)', tz: 'Pacific/Tongatapu' },
];

// Monday 3 August 2026 01:00 UTC — still Sunday 2 August 21:00 in New York (UTC-4).
const JUST_AFTER_MIDNIGHT_UTC = new Date('2026-08-03T01:00:00.000Z');
// Monday 3 August 2026 13:00 UTC — even UTC-12 has reached 3 August (01:00), so nowhere is behind.
const MID_AFTERNOON_UTC = new Date('2026-08-03T13:00:00.000Z');

const control = (value: unknown) => new FormControl(value);
const expectedError = { invalidTodayOrFutureDate: 'The date must be the same as or after 2 August 2026' };

describe.each(TIMEZONES)('todayOrFutureDateValidator in timezone $name', ({ tz }) => {
  const originalTz = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = tz;
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(JUST_AFTER_MIDNIGHT_UTC);
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = originalTz;
  });

  it('should accept the current UTC day', () => {
    expect(todayOrFutureDateValidator()(control(new Date(Date.UTC(2026, 7, 3))))).toBeNull();
  });

  it('should accept a future date', () => {
    expect(todayOrFutureDateValidator()(control(new Date(Date.UTC(2026, 7, 10))))).toBeNull();
  });

  it('should accept the day before the UTC day while it is still today somewhere behind UTC', () => {
    expect(todayOrFutureDateValidator()(control(new Date(Date.UTC(2026, 7, 2))))).toBeNull();
  });

  it('should reject a date that is already in the past everywhere on Earth', () => {
    expect(todayOrFutureDateValidator()(control(new Date(Date.UTC(2026, 7, 1))))).toEqual(expectedError);
  });

  it('should not extend the leniency once every timezone has rolled over', () => {
    vi.setSystemTime(MID_AFTERNOON_UTC);

    expect(todayOrFutureDateValidator()(control(new Date(Date.UTC(2026, 7, 2))))).toEqual({
      invalidTodayOrFutureDate: 'The date must be the same as or after 3 August 2026',
    });
  });

  it('should accept dates supplied as API date strings', () => {
    expect(todayOrFutureDateValidator()(control('2026-08-03'))).toBeNull();
    expect(todayOrFutureDateValidator()(control('2026-08-01'))).toEqual(expectedError);
  });

  it.each([null, undefined, '', 'INVALID_DATE', new Date('nonsense')])(
    'should ignore the empty or unparseable value %s',
    (value) => {
      expect(todayOrFutureDateValidator()(control(value))).toBeNull();
    },
  );
});
