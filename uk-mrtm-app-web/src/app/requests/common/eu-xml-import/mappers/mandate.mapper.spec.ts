import { EuXmlMonitoringPlan } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { mapMandate } from '@requests/common/eu-xml-import/mappers/mandate.mapper';

const ismPlan = (overrides: Partial<EuXmlMonitoringPlan> = {}): EuXmlMonitoringPlan => ({
  '@_shipImoNumber': '1111111',
  company: { nature: 'ISM' },
  ship: {
    name: 'MV Test',
    ownerNumber: '9999999',
    ownerName: 'Owner Co',
    ownerContactPerson: 'Jane Doe',
    ownerEmail: 'jane@owner.example',
  },
  ...overrides,
});

describe('mapMandate', () => {
  it('does not create a registered owner for a SHIPOWNER-nature plan', () => {
    const { mandate } = mapMandate([ismPlan({ company: { nature: 'SHIPOWNER' } })]);

    expect(mandate.exist).toBe(false);
    expect(mandate.registeredOwners).toEqual([]);
  });

  it('creates a registered owner for an ISM-nature plan', () => {
    const { mandate, mandateWarnings } = mapMandate([ismPlan()]);

    expect(mandate.exist).toBe(true);
    expect(mandate.registeredOwners).toHaveLength(1);
    const owner = mandate.registeredOwners[0];
    expect(owner.name).toBe('Owner Co');
    expect(owner.imoNumber).toBe('9999999');
    expect(owner.contactName).toBe('Jane Doe');
    expect(owner.email).toBe('jane@owner.example');
    expect(owner.effectiveDate).toBeNull();
    expect(owner.ships).toEqual([{ imoNumber: '1111111', name: 'MV Test' }]);
    expect(mandateWarnings.some((w) => w.message.includes('effective date'))).toBe(true);
  });

  it('groups multiple ISM ships under the same registered owner', () => {
    const { mandate } = mapMandate([
      ismPlan({
        '@_shipImoNumber': '1111111',
        ship: { name: 'Ship A', ownerNumber: '9999999', ownerName: 'Owner Co' },
      }),
      ismPlan({
        '@_shipImoNumber': '2222222',
        ship: { name: 'Ship B', ownerNumber: '9999999', ownerName: 'Owner Co' },
      }),
    ]);

    expect(mandate.registeredOwners).toHaveLength(1);
    expect(mandate.registeredOwners[0].ships).toEqual([
      { imoNumber: '1111111', name: 'Ship A' },
      { imoNumber: '2222222', name: 'Ship B' },
    ]);
  });

  it('warns and skips when an ISM ship has no owner identification at all', () => {
    const { mandate, mandateWarnings } = mapMandate([ismPlan({ ship: { name: 'MV Test' } })]);

    expect(mandate.registeredOwners).toEqual([]);
    expect(mandateWarnings.some((w) => w.message.includes('no registered owner details were found'))).toBe(true);
  });

  it('falls back to an "IMO <number>" ship name when the ship has no name', () => {
    const { mandate } = mapMandate([
      ismPlan({ '@_shipImoNumber': '1111111', ship: { ownerNumber: '9999999', ownerName: 'Owner Co' } }),
    ]);

    expect(mandate.registeredOwners[0].ships).toEqual([{ imoNumber: '1111111', name: 'IMO 1111111' }]);
  });

  it('creates a registered owner keyed by name and warns about the missing IMO number', () => {
    const { mandate, mandateWarnings } = mapMandate([
      ismPlan({ ship: { name: 'MV Test', ownerName: 'Owner Co', ownerContactPerson: 'Jane', ownerEmail: 'j@e.com' } }),
    ]);

    expect(mandate.registeredOwners).toHaveLength(1);
    expect(mandate.registeredOwners[0]).toMatchObject({ name: 'Owner Co', imoNumber: '' });
    expect(mandateWarnings.some((w) => w.message.includes('IMO number is missing'))).toBe(true);
  });

  it('warns about a missing owner name, contact name and email when only the IMO number is known', () => {
    const { mandate, mandateWarnings } = mapMandate([ismPlan({ ship: { name: 'MV Test', ownerNumber: '9999999' } })]);

    expect(mandate.registeredOwners[0]).toMatchObject({ name: '', email: '' });
    expect(mandate.registeredOwners[0].contactName).toBeUndefined();
    expect(mandateWarnings.some((w) => w.message.includes('name is missing'))).toBe(true);
    expect(mandateWarnings.some((w) => w.message.includes('contact name is missing'))).toBe(true);
    expect(mandateWarnings.some((w) => w.message.includes('email is missing'))).toBe(true);
  });

  it('does not duplicate a ship already associated with the registered owner', () => {
    const plan = ismPlan({ '@_shipImoNumber': '1111111', ship: { name: 'Ship A', ownerNumber: '9999999' } });

    const { mandate } = mapMandate([plan, plan]);

    expect(mandate.registeredOwners).toHaveLength(1);
    expect(mandate.registeredOwners[0].ships).toEqual([{ imoNumber: '1111111', name: 'Ship A' }]);
  });

  it('drops an overly long owner name/contact name instead of truncating them, and warns', () => {
    const { mandate, mandateWarnings } = mapMandate([
      ismPlan({
        ship: {
          name: 'MV Test',
          ownerNumber: '9999999',
          ownerName: 'A'.repeat(300),
          ownerContactPerson: 'B'.repeat(300),
        },
      }),
    ]);

    expect(mandate.registeredOwners[0].name).toBe('');
    expect(mandate.registeredOwners[0].contactName).toBeUndefined();
    expect(mandateWarnings.some((w) => w.message.includes('name exceeds 255 characters'))).toBe(true);
    expect(mandateWarnings.some((w) => w.message.includes('contact name exceeds 255 characters'))).toBe(true);
  });

  it('drops a malformed owner IMO number and warns', () => {
    const { mandate, mandateWarnings } = mapMandate([
      ismPlan({
        ship: { name: 'MV Test', ownerNumber: 'ABC1234', ownerName: 'Owner Co', ownerEmail: 'jane@owner.example' },
      }),
    ]);

    expect(mandate.registeredOwners[0].imoNumber).toBe('');
    expect(mandateWarnings.some((w) => w.message.includes('IMO number must be 7 digits'))).toBe(true);
  });

  it('drops a malformed owner email and warns', () => {
    const { mandate, mandateWarnings } = mapMandate([
      ismPlan({
        ship: { name: 'MV Test', ownerNumber: '9999999', ownerName: 'Owner Co', ownerEmail: 'not-an-email' },
      }),
    ]);

    expect(mandate.registeredOwners[0].email).toBe('');
    expect(mandateWarnings.some((w) => w.message.includes('email is not in a valid format'))).toBe(true);
  });

  it('drops an owner IMO number that matches the account IMO number and warns', () => {
    const { mandate, mandateWarnings } = mapMandate(
      [ismPlan({ ship: { name: 'MV Test', ownerNumber: '9999999', ownerName: 'Owner Co' } })],
      '9999999',
    );

    expect(mandate.registeredOwners[0].imoNumber).toBe('');
    expect(mandateWarnings.some((w) => w.message.includes('IMO number must be 7 digits'))).toBe(true);
  });
});
