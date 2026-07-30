import { TestBed } from '@angular/core/testing';

import { EmpShipsXmlService } from '@requests/common/emp/subtasks/emissions/services';
import {
  mockEmpShipsCoreErrorsXml,
  mockEmpShipsErrorsXml,
  mockEmpShipsXml,
} from '@requests/common/emp/testing/emp-ship-xml.mock';

describe('EmpShipsXmlService', () => {
  let service: EmpShipsXmlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpShipsXmlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should correctly transform ShipXML to XmlShipsResultDto', () => {
    const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
    });

    const result = service.parse(mockEmpShipsXml);
    expect(result).toEqual({
      data: [
        {
          carbonCapture: {
            exist: true,
            technologies: {
              description: 'string',
              technologyEmissionSources: ['Main Engine 1'],
            },
          },
          details: {
            flagState: 'NO',
            grossTonnage: 5000,
            iceClass: 'IC',
            imoNumber: '2222222',
            name: 'Ever Green',
            natureOfReportingResponsibility: 'ISM_COMPANY',
            type: 'BULK',
          },
          emissionsSources: [
            {
              fuelDetails: [
                {
                  methaneSlip: '2',
                  methaneSlipValueType: 'OTHER',
                  name: 'other1',
                  origin: 'RFNBO',
                  type: 'OTHER',
                  uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
                },
                {
                  methaneSlip: '2',
                  methaneSlipValueType: 'OTHER',
                  name: 'other3',
                  origin: 'BIOFUEL',
                  type: 'OTHER',
                  uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
                },
                {
                  methaneSlip: '2',
                  methaneSlipValueType: 'OTHER',
                  name: 'other2',
                  origin: 'FOSSIL',
                  type: 'OTHER',
                  uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
                },
              ],
              monitoringMethod: ['FLOW_METERS'],
              name: 'Main Engine 1',
              referenceNumber: 'IDE-111',
              sourceClass: 'BOILERS',
              type: 'MAIN_ENGINE',
              uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
            },
          ],
          exemptionConditions: {
            exist: true,
            minVoyages: 301,
          },
          fuelsAndEmissionsFactors: [
            {
              carbonDioxide: 0.1,
              densityMethodBunker: 'FUEL_SUPPLIER',
              densityMethodTank: 'FUEL_SUPPLIER',
              methane: 0.1,
              name: 'other1',
              nitrousOxide: 0.2,
              origin: 'RFNBO',
              type: 'OTHER',
              uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
            },
            {
              carbonDioxide: 0.1,
              densityMethodBunker: 'FUEL_SUPPLIER',
              densityMethodTank: 'FUEL_SUPPLIER',
              methane: 0.1,
              name: 'other2',
              nitrousOxide: 0.2,
              origin: 'FOSSIL',
              type: 'OTHER',
              uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
            },
            {
              carbonDioxide: 0.1,
              densityMethodBunker: 'FUEL_SUPPLIER',
              densityMethodTank: 'FUEL_SUPPLIER',
              methane: 0.1,
              name: 'other3',
              nitrousOxide: 0.2,
              origin: 'BIOFUEL',
              type: 'OTHER',
              uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
            },
          ],
          measurements: [
            {
              name: 'device 1',
              technicalDescription: 'description 1',
              emissionSources: ['Main Engine 1'],
            },
          ],
          uncertaintyLevel: [
            {
              methodApproach: 'SHIP_SPECIFIC',
              monitoringMethod: 'FLOW_METERS',
              value: '99.12',
            },
          ],
          uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
        },
      ],
      errors: [],
    });
  });

  it('should return core errors on false core XML', () => {
    const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
    });
    const result = service.parse(mockEmpShipsCoreErrorsXml);
    expect(result).toEqual({
      data: [],
      errors: [
        {
          column: 'shipImoNumber',
          message: 'The IMO Number must be 7 digits and is required',
          row: 1,
        },
        {
          column: 'name',
          message: 'The Ship Name is required and must be less than 255 characters',
          row: 1,
        },
        {
          column: 'name',
          message: 'The Ship Name is required and must be less than 255 characters',
          row: 2,
        },
        {
          column: 'shipImoNumber',
          message: 'There are duplicated IMO numbers in the file. Check the information entered and reupload the file',
          row: 3,
        },
      ],
    });
  });

  it('should return errors on false XML', () => {
    const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
    });
    const result = service.parse(mockEmpShipsErrorsXml);
    expect(result).toEqual({
      data: [],
      errors: [
        {
          column: 'NO_FIELD',
          message:
            'There are errors in the basic ship details data you uploaded. Check the information entered and reupload the file',
          row: 'Ever Green',
        },
        {
          column: 'NO_FIELD',
          message:
            'There are errors in the fuels and emissions factors you uploaded. Check the information entered and reupload the file',
          row: 'Ever Green',
        },
        {
          column: 'NO_FIELD',
          message:
            'There are errors in the emissions sources and fuel types used data you uploaded. Check the information entered and reupload the file',
          row: 'Ever Green',
        },
        {
          column: 'NO_FIELD',
          message:
            'There are errors in the level of uncertainty associated with the fuel monitoring methods data you uploaded. Check the information entered and reupload the file',
          row: 'Ever Green',
        },
        {
          column: 'NO_FIELD',
          message:
            'There are errors in the measurement instruments involved data you uploaded. Check the information entered and reupload the file',
          row: 'Ever Green',
        },
        {
          column: 'NO_FIELD',
          message:
            'There are errors in the conditions of exemption from per voyage monitoring and reporting data you uploaded. Check the information entered and reupload the file',
          row: 'Ever Green',
        },
        {
          column: 'NO_FIELD',
          message:
            'There are errors in the application of carbon capture and storage technologies data you uploaded. Check the information entered and reupload the file',
          row: 'Ever Green',
        },
      ],
    });
  });
});
