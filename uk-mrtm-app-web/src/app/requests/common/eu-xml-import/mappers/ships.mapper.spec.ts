import { EuXmlMonitoringPlan } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { mapShipEmissions } from '@requests/common/eu-xml-import/mappers/ships.mapper';

const basePlan = (overrides: Partial<EuXmlMonitoringPlan> = {}): EuXmlMonitoringPlan => ({
  '@_shipImoNumber': '1234567',
  ship: { name: 'MV Test', shipType: 'BULK', grossTonnage: 50000, flag: 'GB', iceClassPolarCode: 'IA' },
  ...overrides,
});

describe('mapShipEmissions', () => {
  it('derives natureOfReportingResponsibility from company.nature, leaving it undefined when nature is unknown', () => {
    const { ship: ismShip } = mapShipEmissions(basePlan({ company: { nature: 'ISM' } }), 'MV Test');
    expect(ismShip.details.natureOfReportingResponsibility).toBe('ISM_COMPANY');

    const { ship: ownerShip } = mapShipEmissions(basePlan({ company: { nature: 'SHIPOWNER' } }), 'MV Test');
    expect(ownerShip.details.natureOfReportingResponsibility).toBe('SHIPOWNER');

    // No company.nature at all is no longer defaulted to SHIPOWNER — it's left undefined.
    const { ship: noCompanyShip } = mapShipEmissions(basePlan(), 'MV Test');
    expect(noCompanyShip.details.natureOfReportingResponsibility).toBeUndefined();
  });

  it('reads the bunker density method from methodDensityBunkerCode, leaving tank density undefined', () => {
    const { ship } = mapShipEmissions(
      basePlan({
        fuelTypes: {
          fuelTypeEntry: [
            {
              fuelTypeCode: 'HFO',
              fuelOriginCode: 'FOSSIL',
              methodDensityBunkerCode: 'FUEL_SUPPLIER',
              emissionFactors: [{ ghgCode: 'CO2', ttwEF: 3.1 }],
            },
          ],
        },
      }),
      'MV Test',
    );

    expect(ship.fuelsAndEmissionsFactors[0].densityMethodBunker).toBe('FUEL_SUPPLIER');
    // The EU XSD only carries the tank density method per fuel tank, not per fuel type, so there's
    // no reliable source for it — it's left undefined instead of guessed.
    expect(ship.fuelsAndEmissionsFactors[0].densityMethodTank).toBeUndefined();
  });

  describe('fuel classification', () => {
    it('uses otherFuelType as the name when fuelTypeCode is OTHER', () => {
      const { ship } = mapShipEmissions(
        basePlan({
          fuelTypes: {
            fuelTypeEntry: [
              {
                fuelTypeCode: 'OTHER',
                fuelOriginCode: 'FOSSIL',
                otherFuelType: 'Some experimental fuel',
                emissionFactors: [{ ghgCode: 'CO2', ttwEF: 3.1 }],
              },
            ],
          },
        }),
        'MV Test',
      );

      expect(ship.fuelsAndEmissionsFactors[0]).toEqual(
        expect.objectContaining({ origin: 'FOSSIL', type: 'OTHER', name: 'Some experimental fuel' }),
      );
    });

    it('drops a fuel entry entirely when fuelOriginCode is missing or not FOSSIL/BIOFUEL/RFNBO', () => {
      const { ship: missingOrigin } = mapShipEmissions(
        basePlan({ fuelTypes: { fuelTypeEntry: [{ fuelTypeCode: 'HFO' }] } }),
        'MV Test',
      );
      expect(missingOrigin.fuelsAndEmissionsFactors).toEqual([]);

      const { ship: invalidOrigin } = mapShipEmissions(
        basePlan({
          fuelTypes: { fuelTypeEntry: [{ fuelTypeCode: 'HFO', fuelOriginCode: 'NOT_A_REAL_ORIGIN' }] },
        }),
        'MV Test',
      );
      expect(invalidOrigin.fuelsAndEmissionsFactors).toEqual([]);
    });
  });

  describe('emission factors', () => {
    it('maps a positive emission factor to its string value', () => {
      const { ship } = mapShipEmissions(
        basePlan({
          fuelTypes: {
            fuelTypeEntry: [
              { fuelTypeCode: 'HFO', fuelOriginCode: 'FOSSIL', emissionFactors: [{ ghgCode: 'CO2', ttwEF: 3.114 }] },
            ],
          },
        }),
        'MV Test',
      );

      expect(ship.fuelsAndEmissionsFactors[0].carbonDioxide).toBe('3.114');
    });

    it('leaves the value undefined (not the literal string "undefined") when a GHG factor is absent or non-positive', () => {
      const { ship } = mapShipEmissions(
        basePlan({
          fuelTypes: {
            fuelTypeEntry: [
              { fuelTypeCode: 'HFO', fuelOriginCode: 'FOSSIL', emissionFactors: [{ ghgCode: 'CO2', ttwEF: 3.1 }] },
            ],
          },
        }),
        'MV Test',
      );

      // CH4/N2O are absent from the source entry, so they default to 0 before clampEF rejects them.
      expect(ship.fuelsAndEmissionsFactors[0].methane).toBeUndefined();
      expect(ship.fuelsAndEmissionsFactors[0].nitrousOxide).toBeUndefined();
    });

    describe('carbon dioxide', () => {
      it('accepts zero, matching the form provider’s min(0) rule', () => {
        const { ship, shipWarnings } = mapShipEmissions(
          basePlan({
            fuelTypes: {
              fuelTypeEntry: [
                { fuelTypeCode: 'HFO', fuelOriginCode: 'FOSSIL', emissionFactors: [{ ghgCode: 'CO2', ttwEF: 0 }] },
              ],
            },
          }),
          'MV Test',
        );

        expect(ship.fuelsAndEmissionsFactors[0].carbonDioxide).toBe('0');
        expect(shipWarnings.some((w) => w.message.includes('CO₂ emission factor'))).toBe(false);
      });

      it('accepts a value with up to 12 integer digits', () => {
        const { ship } = mapShipEmissions(
          basePlan({
            fuelTypes: {
              fuelTypeEntry: [
                {
                  fuelTypeCode: 'HFO',
                  fuelOriginCode: 'FOSSIL',
                  emissionFactors: [{ ghgCode: 'CO2', ttwEF: 999999999999 }],
                },
              ],
            },
          }),
          'MV Test',
        );

        expect(ship.fuelsAndEmissionsFactors[0].carbonDioxide).toBe('999999999999');
      });

      it('drops the whole fuel entry when CO2 is negative, and warns', () => {
        const { ship, shipWarnings } = mapShipEmissions(
          basePlan({
            fuelTypes: {
              fuelTypeEntry: [
                { fuelTypeCode: 'HFO', fuelOriginCode: 'FOSSIL', emissionFactors: [{ ghgCode: 'CO2', ttwEF: -1 }] },
              ],
            },
          }),
          'MV Test',
        );

        // carbonDioxide is required for the fuel to be usable at all, so an invalid value drops
        // the entire fuel entry rather than just leaving that one field undefined.
        expect(ship.fuelsAndEmissionsFactors).toEqual([]);
        expect(shipWarnings.some((w) => w.message.includes('CO₂ emission factor must be a number 0 or more'))).toBe(
          true,
        );
      });

      it('drops the whole fuel entry when CO2 has more than 12 integer digits, and warns', () => {
        const { ship, shipWarnings } = mapShipEmissions(
          basePlan({
            fuelTypes: {
              fuelTypeEntry: [
                {
                  fuelTypeCode: 'HFO',
                  fuelOriginCode: 'FOSSIL',
                  emissionFactors: [{ ghgCode: 'CO2', ttwEF: 1_000_000_000_000 }],
                },
              ],
            },
          }),
          'MV Test',
        );

        expect(ship.fuelsAndEmissionsFactors).toEqual([]);
        expect(shipWarnings.some((w) => w.message.includes('CO₂ emission factor must be a number 0 or more'))).toBe(
          true,
        );
      });

      it('drops the whole fuel entry when CO2 is missing, and warns', () => {
        const { ship, shipWarnings } = mapShipEmissions(
          basePlan({ fuelTypes: { fuelTypeEntry: [{ fuelTypeCode: 'HFO', fuelOriginCode: 'FOSSIL' }] } }),
          'MV Test',
        );

        expect(ship.fuelsAndEmissionsFactors).toEqual([]);
        expect(shipWarnings.some((w) => w.message.includes('CO₂ emission factor must be a number 0 or more'))).toBe(
          true,
        );
      });
    });
  });

  describe('exemption conditions', () => {
    it('maps exemption conditions from navigation.procedureAnnexITableC1 when minVoyages is more than 300', () => {
      const { ship: withExemption } = mapShipEmissions(
        basePlan({ navigation: { procedureAnnexITableC1: { minimumNumberOfVoyages: '301' } } }),
        'MV Test',
      );
      expect(withExemption.exemptionConditions).toEqual({ exist: true, minVoyages: 301 });

      const { ship: without } = mapShipEmissions(basePlan(), 'MV Test');
      expect(without.exemptionConditions).toEqual({ exist: false });
    });

    it.each([
      ['exactly 300', '300'],
      ['well below the minimum', '5'],
      ['zero', '0'],
      ['negative', '-1'],
      ['non-numeric', 'not-a-number'],
    ])('treats %s minVoyages as not exempt and warns', (_label, minimumNumberOfVoyages) => {
      const { ship, shipWarnings } = mapShipEmissions(
        basePlan({ navigation: { procedureAnnexITableC1: { minimumNumberOfVoyages } } }),
        'MV Test',
      );

      expect(ship.exemptionConditions).toEqual({ exist: false });
      expect(
        shipWarnings.some((w) => w.message.includes('minimum number of expected voyages must be more than 300')),
      ).toBe(true);
    });

    it('does not warn when the ship has no exemption procedure at all', () => {
      const { shipWarnings } = mapShipEmissions(basePlan(), 'MV Test');

      expect(
        shipWarnings.some((w) => w.message.includes('minimum number of expected voyages must be more than 300')),
      ).toBe(false);
    });
  });

  it('maps carbon capture from ccsCcuRecords', () => {
    const { ship } = mapShipEmissions(
      basePlan({
        ccsCcuRecords: {
          ccsCcuEntry: [
            { emissionSourceName: 'Main engine', technology: 'Onboard CCS' },
            { emissionSourceName: 'Aux engine', technology: 'Onboard CCS' },
          ],
        },
      }),
      'MV Test',
    );

    expect(ship.carbonCapture).toEqual({
      exist: true,
      technologies: { description: 'Onboard CCS', technologyEmissionSources: ['Main engine', 'Aux engine'] },
    });

    const { ship: withoutCcs } = mapShipEmissions(basePlan(), 'MV Test');
    expect(withoutCcs.carbonCapture).toEqual({ exist: false });
  });

  it('drops an overly long carbon capture technology description and warns', () => {
    const { ship, shipWarnings } = mapShipEmissions(
      basePlan({
        ccsCcuRecords: {
          ccsCcuEntry: [{ emissionSourceName: 'Main engine', technology: 'D'.repeat(10001) }],
        },
      }),
      'MV Test',
    );

    expect(ship.carbonCapture.technologies?.description).toBe('');
    expect(shipWarnings.some((w) => w.message.includes('technology description is missing'))).toBe(true);
  });

  describe('ship type / ice class', () => {
    it('maps recognised type and ice-class codes', () => {
      const { ship } = mapShipEmissions(basePlan({ ship: { shipType: 'BULK', iceClassPolarCode: 'IA' } }), 'MV Test');

      expect(ship.details.type).toBe('BULK');
      expect(ship.details.iceClass).toBe('IA');
    });

    it('leaves type and iceClass undefined for unrecognised codes instead of defaulting them, and warns for both', () => {
      const { ship, shipWarnings } = mapShipEmissions(
        basePlan({ ship: { shipType: 'NOT_A_REAL_TYPE', iceClassPolarCode: 'NOT_A_REAL_CLASS' } }),
        'MV Test',
      );

      expect(ship.details.type).toBeUndefined();
      expect(ship.details.iceClass).toBeUndefined();
      expect(shipWarnings.some((w) => w.message.includes('ship type is missing or not recognised'))).toBe(true);
      expect(shipWarnings.some((w) => w.message.includes('ice class is missing or not recognised'))).toBe(true);
    });

    it('leaves iceClass undefined when the XML uses "NA" — it is not a recognised ice-class value', () => {
      const { ship } = mapShipEmissions(basePlan({ ship: { iceClassPolarCode: 'NA' } }), 'MV Test');

      expect(ship.details.iceClass).toBeUndefined();
    });
  });

  describe('flag state', () => {
    it('maps a recognised flag code', () => {
      const { ship } = mapShipEmissions(basePlan({ ship: { flag: 'gb' } }), 'MV Test');

      expect(ship.details.flagState).toBe('GB');
    });

    it('leaves flagState undefined and warns for an unrecognised or missing flag', () => {
      const { ship, shipWarnings } = mapShipEmissions(basePlan({ ship: { flag: 'NOT_A_REAL_FLAG' } }), 'MV Test');

      expect(ship.details.flagState).toBeUndefined();
      expect(shipWarnings.some((w) => w.message.includes('flag state is missing or not recognised'))).toBe(true);
    });
  });

  describe('gross tonnage validation', () => {
    it('rounds a non-integer gross tonnage and warns', () => {
      const { ship, shipWarnings } = mapShipEmissions(basePlan({ ship: { grossTonnage: 50000.6 } }), 'MV Test');

      expect(ship.details.grossTonnage).toBe(50001);
      expect(shipWarnings.some((w) => w.message.includes('must be an integer'))).toBe(true);
    });

    it('warns and drops the value when gross tonnage is below the minimum', () => {
      const { ship, shipWarnings } = mapShipEmissions(basePlan({ ship: { grossTonnage: 100 } }), 'MV Test');

      expect(ship.details.grossTonnage).toBeUndefined();
      expect(shipWarnings.some((w) => w.message.includes('is less than the minimum'))).toBe(true);
    });

    it('warns and drops the value when gross tonnage exceeds the maximum', () => {
      const { ship, shipWarnings } = mapShipEmissions(basePlan({ ship: { grossTonnage: 1_000_000_000 } }), 'MV Test');

      expect(ship.details.grossTonnage).toBeUndefined();
      expect(shipWarnings.some((w) => w.message.includes('exceeds the maximum'))).toBe(true);
    });
  });

  it('warns when carbon capture entries disagree on technology description', () => {
    const { shipWarnings } = mapShipEmissions(
      basePlan({
        ccsCcuRecords: {
          ccsCcuEntry: [
            { emissionSourceName: 'Main engine', technology: 'Onboard CCS' },
            { emissionSourceName: 'Aux engine', technology: 'Different tech' },
          ],
        },
      }),
      'MV Test',
    );

    expect(shipWarnings.some((w) => w.message.includes('only the first was imported'))).toBe(true);
  });

  describe('emission sources', () => {
    it('maps known type/class codes and resolves fuel details from the fuel factors map', () => {
      const { ship } = mapShipEmissions(
        basePlan({
          fuelTypes: {
            fuelTypeEntry: [
              { fuelTypeCode: 'HFO', fuelOriginCode: 'FOSSIL', emissionFactors: [{ ghgCode: 'CO2', ttwEF: 3.1 }] },
            ],
          },
          emissionSources: {
            emissionSourceEntry: [
              {
                name: 'Main Engine 1',
                identificationNumber: 'ES-1',
                emissionSourceTypeCode: 'main_engine',
                emissionSourceClassCode: 'ice',
                fuelTypeCode: ['HFO'],
                monitoringMethodCode: ['bdn'],
              },
            ],
          },
        }),
        'MV Test',
      );

      expect(ship.emissionsSources).toHaveLength(1);
      const source = ship.emissionsSources[0];
      expect(source.name).toBe('Main Engine 1');
      expect(source.referenceNumber).toBe('ES-1');
      expect(source.type).toBe('MAIN_ENGINE');
      expect(source.sourceClass).toBe('ICE');
      expect(source.monitoringMethod).toEqual(['BDN']);
      expect(source.fuelDetails).toEqual([
        expect.objectContaining({
          uniqueIdentifier: ship.fuelsAndEmissionsFactors[0].uniqueIdentifier,
          origin: 'FOSSIL',
        }),
      ]);
    });

    it('leaves type undefined (but still falls back sourceClass to ICE) for unrecognised codes, warns on both, and drops unclassifiable fuel codes', () => {
      const { ship, shipWarnings } = mapShipEmissions(
        basePlan({
          emissionSources: {
            emissionSourceEntry: [
              {
                name: 'Mystery Source',
                emissionSourceTypeCode: 'NOT_A_REAL_TYPE',
                emissionSourceClassCode: 'NOT_A_REAL_CLASS',
                fuelTypeCode: ['SOME_UNKNOWN_FUEL'],
              },
            ],
          },
        }),
        'MV Test',
      );

      const source = ship.emissionsSources[0];
      expect(source.type).toBeUndefined();
      expect(source.sourceClass).toBe('ICE');
      // An unclassifiable fuel code is dropped entirely rather than guessed as FOSSIL/OTHER.
      expect(source.fuelDetails).toEqual([]);
      expect(shipWarnings.some((w) => w.message.includes('emission source type is missing or not recognised'))).toBe(
        true,
      );
      expect(shipWarnings.some((w) => w.message.includes('emission source class is missing or not recognised'))).toBe(
        true,
      );
    });

    it('drops an overly long source name instead of truncating it, and warns', () => {
      const { ship, shipWarnings } = mapShipEmissions(
        basePlan({
          emissionSources: { emissionSourceEntry: [{ name: 'A'.repeat(300) }] },
        }),
        'MV Test',
      );

      expect(ship.emissionsSources[0].name).toBeUndefined();
      expect(shipWarnings.some((w) => w.message.includes('emission source name is missing'))).toBe(true);
    });

    it('warns on duplicate source names and when no valid monitoring method is present', () => {
      const { shipWarnings, ship } = mapShipEmissions(
        basePlan({
          emissionSources: {
            emissionSourceEntry: [{ name: 'Duplicate', monitoringMethodCode: ['not-a-method'] }, { name: 'Duplicate' }],
          },
        }),
        'MV Test',
      );

      expect(ship.emissionsSources[0].monitoringMethod).toEqual([]);
      expect(shipWarnings.some((w) => w.message.includes('duplicate emission source name'))).toBe(true);
      expect(shipWarnings.some((w) => w.message.includes('no valid monitoring method found'))).toBe(true);
    });
  });

  describe('measurements', () => {
    it('links measuring equipment applied to emission sources by name', () => {
      const { ship } = mapShipEmissions(
        basePlan({
          measuringEquipment: {
            measuringEquipmentEntry: [
              { name: 'Flow meter 1', appliedToCode: ['EMISSION_SOURCES'], technicalDescription: 'Mass flow meter' },
              { name: 'Tank gauge', appliedToCode: ['FUEL_TANKS'] },
            ],
          },
          emissionSources: {
            emissionSourceEntry: [{ name: 'Main Engine 1', measuringEquipmentName: 'Flow meter 1' }],
          },
        }),
        'MV Test',
      );

      expect(ship.measurements).toEqual([
        { name: 'Flow meter 1', technicalDescription: 'Mass flow meter', emissionSources: ['Main Engine 1'] },
      ]);
    });

    it('warns when a measurement applied to emission sources has no linked source', () => {
      const { shipWarnings } = mapShipEmissions(
        basePlan({
          measuringEquipment: {
            measuringEquipmentEntry: [{ name: 'Orphan meter', appliedToCode: ['EMISSION_SOURCES'] }],
          },
        }),
        'MV Test',
      );

      expect(shipWarnings.some((w) => w.message.includes('no linked emission sources found'))).toBe(true);
    });
  });

  describe('uncertainty level', () => {
    it('aggregates one entry per unique monitoring method', () => {
      const { ship } = mapShipEmissions(
        basePlan({
          emissionSources: {
            emissionSourceEntry: [
              {
                monitoringMethodCode: ['bdn'],
                levelOfUncertaintyTypeCode: 'ship_specific',
                shipSpecificUncertainty: 1.5,
              },
              { monitoringMethodCode: ['bdn'], levelOfUncertaintyTypeCode: 'default' },
              { monitoringMethodCode: ['flow_meters'] },
              { monitoringMethodCode: ['not-a-method'] },
            ],
          },
        }),
        'MV Test',
      );

      // FLOW_METERS has no shipSpecificUncertainty, so it fails the value rule below and both
      // methodApproach and value are left undefined, regardless of the DEFAULT approach code.
      expect(ship.uncertaintyLevel).toEqual([
        { monitoringMethod: 'BDN', methodApproach: 'SHIP_SPECIFIC', value: '1.5' },
        { monitoringMethod: 'FLOW_METERS', methodApproach: undefined, value: undefined },
      ]);
    });

    it('accepts a SHIP_SPECIFIC value up to 100 with up to 2 decimal places', () => {
      const { ship } = mapShipEmissions(
        basePlan({
          emissionSources: {
            emissionSourceEntry: [
              {
                monitoringMethodCode: ['bdn'],
                levelOfUncertaintyTypeCode: 'ship_specific',
                shipSpecificUncertainty: 100,
              },
            ],
          },
        }),
        'MV Test',
      );

      expect(ship.uncertaintyLevel).toEqual([
        { monitoringMethod: 'BDN', methodApproach: 'SHIP_SPECIFIC', value: '100' },
      ]);
    });

    it.each([
      ['zero', 0],
      ['negative', -1],
      ['over 100', 100.01],
      ['more than 2 decimal places', 1.567],
    ])('drops a SHIP_SPECIFIC value that is %s', (_label, shipSpecificUncertainty) => {
      const { ship } = mapShipEmissions(
        basePlan({
          emissionSources: {
            emissionSourceEntry: [
              { monitoringMethodCode: ['bdn'], levelOfUncertaintyTypeCode: 'ship_specific', shipSpecificUncertainty },
            ],
          },
        }),
        'MV Test',
      );

      // An invalid value drops methodApproach along with it, since methodApproach is only set
      // once a valid value is present.
      expect(ship.uncertaintyLevel).toEqual([{ monitoringMethod: 'BDN', methodApproach: undefined, value: undefined }]);
    });

    it('drops a missing SHIP_SPECIFIC value', () => {
      const { ship } = mapShipEmissions(
        basePlan({
          emissionSources: {
            emissionSourceEntry: [{ monitoringMethodCode: ['bdn'], levelOfUncertaintyTypeCode: 'ship_specific' }],
          },
        }),
        'MV Test',
      );

      expect(ship.uncertaintyLevel).toEqual([{ monitoringMethod: 'BDN', methodApproach: undefined, value: undefined }]);
    });
  });
});
