import { mapGreenhouseGas } from '@requests/common/eu-xml-import/mappers/greenhouse-gas.mapper';

describe('mapGreenhouseGas', () => {
  it('maps C22/C23/C25/C28/C3 procedures to the respective fields', () => {
    const { greenhouseGas } = mapGreenhouseGas({
      fuelConsumption: {
        procedureAnnexITableC22: { referenceExistingProcedure: 'REF-C22', procedures: 'Fuel bunkered' },
        procedureAnnexITableC23: { referenceExistingProcedure: 'REF-C23', procedures: 'Cross checks' },
      },
      measuringEquipment: {
        procedureAnnexITableC25: { referenceExistingProcedure: 'REF-C25', procedures: 'Recording info' },
        procedureAnnexITableC28: { referenceExistingProcedure: 'REF-C28', procedures: 'QA equipment' },
      },
      navigation: {
        procedureAnnexITableC3: { referenceExistingProcedure: 'REF-C3', procedures: 'List of voyages' },
      },
    });

    expect(greenhouseGas.fuel.reference).toBe('REF-C22');
    expect(greenhouseGas.crossChecks.reference).toBe('REF-C23');
    expect(greenhouseGas.information.reference).toBe('REF-C25');
    expect(greenhouseGas.qaEquipment.reference).toBe('REF-C28');
    expect(greenhouseGas.voyages.reference).toBe('REF-C3');
  });
});
