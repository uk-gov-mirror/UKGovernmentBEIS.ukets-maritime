import { mapDataGaps } from '@requests/common/eu-xml-import/mappers/data-gaps.mapper';

describe('mapDataGaps', () => {
  it('maps the D1 procedure fields', () => {
    const { dataGaps, dataGapsWarnings } = mapDataGaps({
      fuelConsumption: {
        procedureAnnexITableD1: {
          formulaeUsed: 'Formula X',
          methodFuelConsumption: 'Interpolation',
          responsiblePerson: 'John Smith',
          dataSources: 'Bunker delivery notes',
          locationOfRecords: 'Head office',
          itSystem: 'ERP',
        },
      },
    });

    expect(dataGaps).toEqual({
      formulaeUsed: 'Formula X',
      fuelConsumptionEstimationMethod: 'Interpolation',
      responsiblePersonOrPosition: 'John Smith',
      dataSources: 'Bunker delivery notes',
      recordsLocation: 'Head office',
      itSystemUsed: 'ERP',
    });
    expect(dataGapsWarnings).toEqual([]);
  });

  it('warns when the fuel consumption estimation method, responsible person, data sources and records location are missing', () => {
    const { dataGaps, dataGapsWarnings } = mapDataGaps({});

    expect(dataGaps.fuelConsumptionEstimationMethod).toBeUndefined();
    expect(dataGapsWarnings.some((w) => w.message.includes('method to estimate fuel consumption is missing'))).toBe(
      true,
    );
    expect(dataGapsWarnings.some((w) => w.message.includes('responsible person or position is missing'))).toBe(true);
    expect(dataGapsWarnings.some((w) => w.message.includes('data sources are missing'))).toBe(true);
    expect(dataGapsWarnings.some((w) => w.message.includes('location of records is missing'))).toBe(true);
  });

  it('does not throw and leaves every field undefined when the D1 procedure table is entirely absent', () => {
    expect(() => mapDataGaps({})).not.toThrow();

    const { dataGaps } = mapDataGaps({});

    expect(dataGaps).toEqual({
      formulaeUsed: undefined,
      fuelConsumptionEstimationMethod: undefined,
      responsiblePersonOrPosition: undefined,
      dataSources: undefined,
      recordsLocation: undefined,
      itSystemUsed: '',
    });
  });

  it('drops overly long field values instead of truncating them', () => {
    const tooLong = 'X'.repeat(20000);

    const { dataGaps, dataGapsWarnings } = mapDataGaps({
      fuelConsumption: {
        procedureAnnexITableD1: {
          formulaeUsed: tooLong,
          methodFuelConsumption: tooLong,
          responsiblePerson: 'A'.repeat(300),
          dataSources: tooLong,
          locationOfRecords: 'B'.repeat(300),
          itSystem: 'C'.repeat(300),
        },
      },
    });

    expect(dataGaps.formulaeUsed).toBeUndefined();
    expect(dataGaps.fuelConsumptionEstimationMethod).toBeUndefined();
    expect(dataGaps.responsiblePersonOrPosition).toBeUndefined();
    expect(dataGaps.dataSources).toBeUndefined();
    expect(dataGaps.recordsLocation).toBeUndefined();
    expect(dataGaps.itSystemUsed).toBeUndefined();
    expect(dataGapsWarnings.some((w) => w.message.includes('method to estimate fuel consumption is missing'))).toBe(
      true,
    );
  });
});
