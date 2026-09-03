import { FormControl } from '@angular/forms';

import { futureDateValidator } from '@shared/validators';

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
const expectedError = { invalidFutureDate: 'The date must be after 2 August 2026' };

describe.each(TIMEZONES)('futureDateValidator in timezone $name', ({ tz }) => {
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

  it('should accept a date after the current UTC day', () => {
    expect(futureDateValidator()(control(new Date(Date.UTC(2026, 7, 10))))).toBeNull();
  });

  it('should accept the current UTC day, which is still tomorrow for a user behind UTC', () => {
    expect(futureDateValidator()(control(new Date(Date.UTC(2026, 7, 3))))).toBeNull();
  });

  it('should reject a date that is today or earlier everywhere on Earth', () => {
    expect(futureDateValidator()(control(new Date(Date.UTC(2026, 7, 2))))).toEqual(expectedError);
    expect(futureDateValidator()(control(new Date(Date.UTC(2026, 7, 1))))).toEqual(expectedError);
  });

  it('should not extend the leniency once every timezone has rolled over', () => {
    vi.setSystemTime(MID_AFTERNOON_UTC);

    expect(futureDateValidator()(control(new Date(Date.UTC(2026, 7, 3))))).toEqual({
      invalidFutureDate: 'The date must be after 3 August 2026',
    });
  });

  it('should name the field when a partial message is provided', () => {
    expect(futureDateValidator('The penalty payment due date')(control(new Date(Date.UTC(2026, 7, 1))))).toEqual({
      invalidFutureDate: 'The penalty payment due date must be after 2 August 2026',
    });
  });

  it.each([null, undefined, '', 'INVALID_DATE', new Date('nonsense')])(
    'should ignore the empty or unparseable value %s',
    (value) => {
      expect(futureDateValidator()(control(value))).toBeNull();
    },
  );
});
