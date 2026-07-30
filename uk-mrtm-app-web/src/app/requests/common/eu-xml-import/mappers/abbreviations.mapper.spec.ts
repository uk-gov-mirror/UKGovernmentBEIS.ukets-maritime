import { mapAbbreviations } from '@requests/common/eu-xml-import/mappers/abbreviations.mapper';

describe('mapAbbreviations', () => {
  it('returns exist: false and no definitions when there are no entries', () => {
    const { abbreviations, abbrevWarnings } = mapAbbreviations({});

    expect(abbreviations).toEqual({ exist: false, abbreviationDefinitions: undefined });
    expect(abbrevWarnings).toEqual([]);
  });

  it('maps abbreviation entries, skipping ones without an abbreviation', () => {
    const { abbreviations, abbrevWarnings } = mapAbbreviations({
      furtherInformation: {
        furtherInformationEntry: [
          { abbreviation: 'MRV', explanation: 'Monitoring, Reporting and Verification' },
          { abbreviation: '', explanation: 'no abbreviation, should be skipped' },
        ],
      },
    });

    expect(abbreviations).toEqual({
      exist: true,
      abbreviationDefinitions: [{ abbreviation: 'MRV', definition: 'Monitoring, Reporting and Verification' }],
    });
    expect(abbrevWarnings).toEqual([]);
  });

  it('leaves the definition undefined when the explanation is missing', () => {
    const { abbreviations } = mapAbbreviations({
      furtherInformation: { furtherInformationEntry: [{ abbreviation: 'MRV' }] },
    });

    expect(abbreviations.abbreviationDefinitions?.[0]).toEqual({ abbreviation: 'MRV', definition: undefined });
  });

  it('drops overly long abbreviations and definitions instead of truncating them', () => {
    const longAbbreviation = 'A'.repeat(40);
    const longDefinition = 'D'.repeat(300);

    const { abbreviations, abbrevWarnings } = mapAbbreviations({
      furtherInformation: {
        furtherInformationEntry: [{ abbreviation: longAbbreviation, explanation: longDefinition }],
      },
    });

    expect(abbreviations.abbreviationDefinitions?.[0].abbreviation).toBeUndefined();
    expect(abbreviations.abbreviationDefinitions?.[0].definition).toBeUndefined();
    expect(abbrevWarnings).toEqual([]);
  });
});
