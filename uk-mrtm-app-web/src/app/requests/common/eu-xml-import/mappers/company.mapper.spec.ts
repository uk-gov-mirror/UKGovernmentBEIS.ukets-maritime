import { mapOperatorDetails } from '@requests/common/eu-xml-import/mappers/company.mapper';

describe('mapOperatorDetails', () => {
  it('maps ship owner fields to operator details, using the account IMO number supplied by the caller', () => {
    const { operatorDetails, operatorWarnings } = mapOperatorDetails(
      {
        ship: {
          ownerName: 'Acme Shipping Ltd',
          ownerAddress: '1 Harbour Road',
          ownerCity: 'Piraeus',
          ownerCountry: 'GR',
        },
        company: { number: '1234567' },
      },
      '7654321',
    );

    expect(operatorDetails.operatorName).toBe('Acme Shipping Ltd');
    // imoNumber always comes from the account service, never the XML's company.number.
    expect(operatorDetails.imoNumber).toBe('7654321');
    expect(operatorDetails.contactAddress).toEqual({ line1: '1 Harbour Road', city: 'Piraeus', country: 'GR' });
    expect(operatorDetails.activityDescription).toBe('');
    expect(operatorWarnings.some((w) => w.message.includes('legal status'))).toBe(true);
    expect(operatorWarnings.some((w) => w.message.includes('activity description'))).toBe(true);
  });

  it('falls back to the company section for the contact address, but not for the operator name', () => {
    const { operatorDetails } = mapOperatorDetails({
      company: {
        name: 'Acme Shipping Ltd',
        number: '1234567',
        address: '1 Harbour Road',
        city: 'Piraeus',
        countryCode: 'GR',
      },
    });

    // operatorName only ever reads ship.ownerName — there's no company.name fallback, so it's
    // left undefined (not defaulted to the company name) when the ship record has none.
    expect(operatorDetails.operatorName).toBeUndefined();
    expect(operatorDetails.contactAddress).toEqual({ line1: '1 Harbour Road', city: 'Piraeus', country: 'GR' });
  });

  it('prefers ship owner fields over the company section when both are present', () => {
    const { operatorDetails } = mapOperatorDetails({
      ship: { ownerName: 'Owner Name', ownerAddress: 'Owner Address', ownerCity: 'Owner City', ownerCountry: 'GB' },
      company: { name: 'Company Name', address: 'Company Address', city: 'Company City', countryCode: 'GR' },
    });

    expect(operatorDetails.operatorName).toBe('Owner Name');
    expect(operatorDetails.contactAddress).toEqual({ line1: 'Owner Address', city: 'Owner City', country: 'GB' });
  });

  it('warns when no account IMO number is supplied by the caller', () => {
    const { operatorDetails, operatorWarnings } = mapOperatorDetails({
      ship: { ownerName: 'Acme Shipping Ltd' },
      company: { number: '1234567' },
    });

    // company.number from the XML is never used as a fallback.
    expect(operatorDetails.imoNumber).toBeUndefined();
    expect(operatorWarnings.some((w) => w.message.includes('company IMO number is missing'))).toBe(true);
  });

  it('warns when company details are entirely missing', () => {
    const { operatorDetails, operatorWarnings } = mapOperatorDetails({});

    expect(operatorDetails.operatorName).toBeUndefined();
    expect(operatorDetails.imoNumber).toBeUndefined();
    expect(operatorWarnings.some((w) => w.message.includes('operator name is missing'))).toBe(true);
    expect(operatorWarnings.some((w) => w.message.includes('company IMO number is missing'))).toBe(true);
    expect(operatorWarnings.some((w) => w.message.includes('contact address is incomplete'))).toBe(true);
  });
});
