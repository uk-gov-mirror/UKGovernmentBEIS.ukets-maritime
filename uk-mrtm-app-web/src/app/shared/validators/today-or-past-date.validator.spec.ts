import { FormControl } from '@angular/forms';

import { todayOrPastDateValidator } from '@shared/validators';

// The validator must behave identically wherever the browser happens to be.
const TIMEZONES = [
  { name: 'behind UTC (America/New_York)', tz: 'America/New_York' },
  { name: 'at UTC (UTC)', tz: 'UTC' },
  { name: 'ahead of UTC (Pacific/Tongatapu)', tz: 'Pacific/Tongatapu' },
];

// Monday 3 August 2026 13:00 UTC — Tuesday 4 August 02:00 in Tonga (UTC+13).
const MID_AFTERNOON_UTC = new Date('2026-08-03T13:00:00.000Z');
// Monday 3 August 2026 03:00 UTC — nowhere on Earth has reached 4 August yet (UTC+14 is 17:00 on the 3rd).
const EARLY_MORNING_UTC = new Date('2026-08-03T03:00:00.000Z');

const control = (value: unknown) => new FormControl(value);

describe.each(TIMEZONES)('todayOrPastDateValidator in timezone $name', ({ tz }) => {
  const originalTz = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = tz;
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(MID_AFTERNOON_UTC);
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = originalTz;
  });

  it('should accept the UTC day before today', () => {
    expect(todayOrPastDateValidator()(control(new Date(Date.UTC(2026, 7, 2))))).toBeNull();
  });

  it('should accept the current UTC day', () => {
    expect(todayOrPastDateValidator()(control(new Date(Date.UTC(2026, 7, 3))))).toBeNull();
  });

  it('should accept the day after the UTC day while it is already today somewhere ahead of UTC', () => {
    expect(todayOrPastDateValidator()(control(new Date(Date.UTC(2026, 7, 4))))).toBeNull();
  });

  it('should reject a date that is not yet today anywhere on Earth', () => {
    expect(todayOrPastDateValidator()(control(new Date(Date.UTC(2026, 7, 5))))).toEqual({
      invalidTodayOrPastDate: 'The date must be the same as or before 4 August 2026',
    });
  });

  it('should not extend the leniency once no timezone has rolled over yet', () => {
    vi.setSystemTime(EARLY_MORNING_UTC);

    expect(todayOrPastDateValidator()(control(new Date(Date.UTC(2026, 7, 4))))).toEqual({
      invalidTodayOrPastDate: 'The date must be the same as or before 3 August 2026',
    });
  });

  it('should name the field when a partial message is provided', () => {
    expect(todayOrPastDateValidator('The date of written agreement')(control(new Date(Date.UTC(2026, 7, 5))))).toEqual({
      invalidTodayOrPastDate: 'The date of written agreement must be the same as or before 4 August 2026',
    });
  });

  it('should accept dates supplied as API date strings', () => {
    expect(todayOrPastDateValidator()(control('2026-08-03'))).toBeNull();
    expect(todayOrPastDateValidator()(control('2026-08-05'))).toEqual({
      invalidTodayOrPastDate: 'The date must be the same as or before 4 August 2026',
    });
  });

  it.each([null, undefined, '', 'INVALID_DATE', new Date('nonsense')])(
    'should ignore the empty or unparseable value %s',
    (value) => {
      expect(todayOrPastDateValidator()(control(value))).toBeNull();
    },
  );
});
