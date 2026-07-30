import { EuXmlImportService } from '@requests/common/eu-xml-import/eu-xml-import.service';

const monitoringPlan = (imoNumber: string, shipName: string) => `
  <monitoringPlan shipImoNumber="${imoNumber}">
    <ship>
      <name>${shipName}</name>
      <shipType>BULK</shipType>
      <grossTonnage>50000</grossTonnage>
      <flag>GB</flag>
    </ship>
  </monitoringPlan>
`;

const buildXml = (plans: string[]) => `<?xml version="1.0"?><monitoringPlans>${plans.join('')}</monitoringPlans>`;

describe('EuXmlImportService', () => {
  let service: EuXmlImportService;

  beforeEach(() => {
    service = new EuXmlImportService();
  });

  it('parses a file containing a single ship', () => {
    const result = service.parse(buildXml([monitoringPlan('1234567', 'MV Test')]));

    expect(result.errors).toBeUndefined();
    expect(result.data?.shipEmissions).toHaveLength(1);
    expect(result.data?.mandate).toEqual({ exist: false, registeredOwners: [] });
  });

  it('populates mandate.registeredOwners for an ISM-nature ship', () => {
    const xml = `<?xml version="1.0"?><monitoringPlans>
      <monitoringPlan shipImoNumber="1234567">
        <ship>
          <name>MV Test</name>
          <shipType>BULK</shipType>
          <grossTonnage>50000</grossTonnage>
          <flag>GB</flag>
          <ownerNumber>9999999</ownerNumber>
          <ownerName>Owner Co</ownerName>
          <ownerContactPerson>Jane Doe</ownerContactPerson>
          <ownerEmail>jane@owner.example</ownerEmail>
        </ship>
        <company>
          <nature>ISM</nature>
        </company>
      </monitoringPlan>
    </monitoringPlans>`;

    const result = service.parse(xml);

    expect(result.data?.mandate.exist).toBe(true);
    expect(result.data?.mandate.registeredOwners).toEqual([
      expect.objectContaining({
        name: 'Owner Co',
        imoNumber: '9999999',
        contactName: 'Jane Doe',
        email: 'jane@owner.example',
        ships: [{ imoNumber: '1234567', name: 'MV Test' }],
      }),
    ]);
  });

  it('rejects a file containing more than one ship', () => {
    const result = service.parse(
      buildXml([monitoringPlan('1234567', 'MV Test'), monitoringPlan('7654321', 'MV Other')]),
    );

    expect(result.data).toBeUndefined();
    expect(result.errors).toEqual([{ row: null, column: null, message: 'The maximum number of ships allowed is 1' }]);
  });

  it('rejects a file with no monitoring plan', () => {
    const result = service.parse('<?xml version="1.0"?><monitoringPlans></monitoringPlans>');

    expect(result.errors?.[0].message).toBe('No monitoring plan found in the file.');
  });

  it('rejects a file that is not well-formed XML', () => {
    const result = service.parse('<monitoringPlans><![CDATA[unterminated</monitoringPlans>');

    expect(result.errors).toEqual([
      {
        row: null,
        column: null,
        message: 'The selected file could not be uploaded – check the file and try again',
      },
    ]);
  });

  it('rejects a ship with a missing IMO number', () => {
    const result = service.parse(buildXml([monitoringPlan('', 'MV Test')]));

    expect(result.data).toBeUndefined();
    expect(result.errors).toEqual([
      { row: null, column: null, message: 'The IMO Number must be 7 digits and is required' },
    ]);
  });

  it('rejects a ship with an IMO number that is not exactly 7 digits', () => {
    const result = service.parse(buildXml([monitoringPlan('123456', 'MV Test')]));

    expect(result.errors).toEqual([
      { row: null, column: null, message: 'The IMO Number must be 7 digits and is required' },
    ]);
  });

  it('rejects a ship with a non-numeric IMO number', () => {
    const result = service.parse(buildXml([monitoringPlan('ABCDEFG', 'MV Test')]));

    expect(result.errors).toEqual([
      { row: null, column: null, message: 'The IMO Number must be 7 digits and is required' },
    ]);
  });
});
