import { TestBed } from '@angular/core/testing';

import { AerShipsXmlService } from '@requests/common/aer/subtasks/aer-emissions/services';
import { aerShipsXmlMock, mockAerShipsPartialErrorsXml } from '@requests/common/aer/testing';

describe('AerShipsXmlService', () => {
  let service: AerShipsXmlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AerShipsXmlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should correctly transform ShipXML to XmlShipsResultDto', () => {
    const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
    });

    const result = service.parse(aerShipsXmlMock, '2025');
    expect(result).toEqual({
      data: [
        {
          dataInputType: 'MANUAL',
          derogations: {
            exceptionFromPerVoyageMonitoring: false,
          },
          details: {
            allYear: true,
            flagState: 'GR',
            from: null,
            grossTonnage: 10000,
            iceClass: 'PC1',
            imoNumber: '1111111',
            name: 'Ship A1',
            natureOfReportingResponsibility: 'SHIPOWNER',
            to: null,
            type: 'RORO',
          },
          emissionsSources: [
            {
              fuelDetails: [
                {
                  methaneSlip: null,
                  methaneSlipValueType: null,
                  name: null,
                  origin: 'FOSSIL',
                  type: 'HFO',
                  uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
                },
                {
                  methaneSlip: null,
                  methaneSlipValueType: null,
                  name: null,
                  origin: 'BIOFUEL',
                  type: 'BIO_DIESEL',
                  uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
                },
              ],
              monitoringMethod: ['BDN'],
              name: 'Main Engine 1',
              sourceClass: 'ICE',
              type: 'MAIN_ENGINE',
              uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
            },
            {
              fuelDetails: [
                {
                  methaneSlip: null,
                  methaneSlipValueType: null,
                  name: null,
                  origin: 'FOSSIL',
                  type: 'HFO',
                  uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
                },
              ],
              monitoringMethod: ['FLOW_METERS'],
              name: 'Main Engine 2',
              sourceClass: 'ICE',
              type: 'AUX_ENGINE',
              uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
            },
          ],
          fuelsAndEmissionsFactors: [
            {
              carbonDioxide: '3.114',
              methane: 0.14,
              name: null,
              nitrousOxide: 0.12,
              origin: 'FOSSIL',
              type: 'HFO',
              uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
            },
            {
              carbonDioxide: '2.834',
              methane: 0.24,
              name: null,
              nitrousOxide: 0.22,
              origin: 'BIOFUEL',
              type: 'BIO_DIESEL',
              uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
            },
          ],
          uncertaintyLevel: [
            {
              methodApproach: 'DEFAULT',
              monitoringMethod: 'BDN',
              value: '7.5',
            },
            {
              methodApproach: 'SHIP_SPECIFIC',
              monitoringMethod: 'FLOW_METERS',
              value: '0.01',
            },
          ],
          uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
        },
        {
          dataInputType: 'MANUAL',
          derogations: {
            exceptionFromPerVoyageMonitoring: true,
          },
          details: {
            allYear: false,
            flagState: 'US',
            from: '2025-01-01',
            grossTonnage: 20000,
            iceClass: 'NA',
            imoNumber: '2222222',
            name: 'Ship B1',
            natureOfReportingResponsibility: 'ISM_COMPANY',
            to: '2025-12-31',
            type: 'OIL',
          },
          emissionsSources: [
            {
              fuelDetails: [
                {
                  methaneSlip: '3.1',
                  methaneSlipValueType: 'PRESELECTED',
                  name: null,
                  origin: 'FOSSIL',
                  type: 'LNG',
                  uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
                },
              ],
              monitoringMethod: ['DIRECT'],
              name: 'Gas Turbine 1',
              sourceClass: 'GAS_TURBINE',
              type: 'GAS_TURBINE',
              uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
            },
          ],
          fuelsAndEmissionsFactors: [
            {
              carbonDioxide: '2.75',
              methane: '0',
              name: null,
              nitrousOxide: '0.00011',
              origin: 'FOSSIL',
              type: 'LNG',
              uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
            },
          ],
          uncertaintyLevel: [
            {
              methodApproach: 'DEFAULT',
              monitoringMethod: 'DIRECT',
              value: '7.5',
            },
          ],
          uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
        },
      ],
      errors: [],
    });
  });

  it('should return errors on false XML', () => {
    const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
    });
    const result = service.parse(mockAerShipsPartialErrorsXml, '2023');
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
});
