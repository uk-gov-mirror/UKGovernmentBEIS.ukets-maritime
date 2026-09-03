import { FormControl } from '@angular/forms';

import { csvFieldTodayOrPastDateValidator } from '@shared/validators';

const TIMEZONES = [
  { name: 'behind UTC (America/New_York)', tz: 'America/New_York' },
  { name: 'at UTC (UTC)', tz: 'UTC' },
  { name: 'ahead of UTC (Pacific/Tongatapu)', tz: 'Pacific/Tongatapu' },
];

// Monday 3 August 2026 13:00 UTC — Tuesday 4 August 02:00 in Tonga (UTC+13).
const MID_AFTERNOON_UTC = new Date('2026-08-03T13:00:00.000Z');

interface CsvRow {
  visitDate: string;
}

const csvMap: Record<keyof CsvRow, string> = { visitDate: 'Visit date' };
const validator = csvFieldTodayOrPastDateValidator<CsvRow>(
  'visitDate',
  csvMap,
  'The date must be today or in the past',
);
const control = (rows: CsvRow[] | null) => new FormControl(rows);

describe.each(TIMEZONES)('csvFieldTodayOrPastDateValidator in timezone $name', ({ tz }) => {
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

  it('should accept rows dated today or in the past', () => {
    expect(validator(control([{ visitDate: '02/08/2026' }, { visitDate: '03/08/2026' }]))).toBeNull();
  });

  it('should accept the day after the UTC day while it is already today somewhere ahead of UTC', () => {
    expect(validator(control([{ visitDate: '04/08/2026' }]))).toBeNull();
  });

  it('should report the row of a date that is not yet today anywhere on Earth', () => {
    expect(validator(control([{ visitDate: '03/08/2026' }, { visitDate: '05/08/2026' }]))).toEqual({
      csvFieldTodayOrPastDatevisitDate: {
        rows: [{ rowIndex: 3 }],
        columns: ['Visit date'],
        message: 'The date must be today or in the past',
      },
    });
  });

  it('should report every offending row', () => {
    expect(validator(control([{ visitDate: '06/08/2026' }, { visitDate: '05/08/2026' }]))).toEqual({
      csvFieldTodayOrPastDatevisitDate: {
        rows: [{ rowIndex: 2 }, { rowIndex: 3 }],
        columns: ['Visit date'],
        message: 'The date must be today or in the past',
      },
    });
  });

  it('should ignore a value that is not an array', () => {
    expect(validator(control(null))).toBeNull();
  });
});
