import { TestBed } from '@angular/core/testing';

import { RequestTaskStore } from '@netz/common/store';

import { TaskItemStatus } from '@requests/common';
import { AerAggregatedDataXmlService } from '@requests/common/aer/subtasks/aer-aggregated-data/services';
import {
  aerAggregatedDataXmlMock,
  aerEmissionsMock,
  mockAerAggregatedDataPartialErrorsXml,
  mockAerStateBuild,
} from '@requests/common/aer/testing';

describe('AerAggregatedDataXmlService', () => {
  let service: AerAggregatedDataXmlService;
  let store: RequestTaskStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AerAggregatedDataXmlService);
    store = TestBed.inject(RequestTaskStore);
    store.setState(mockAerStateBuild({ emissions: aerEmissionsMock }, { emissions: TaskItemStatus.COMPLETED }));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should correctly transform AerAggregatedDataXML to AerAggregatedDataXmlResultDto', () => {
    const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
    });

    const result = service.parse(aerAggregatedDataXmlMock);
    expect(result).toEqual({
      data: [
        {
          dataInputType: 'MANUAL',
          emissionsBetweenUKAndNIVoyages: {
            ch4: '12.87654',
            co2: '500.12345',
            n2o: '3.45678',
          },
          emissionsBetweenUKPorts: {
            ch4: '6.54321',
            co2: '250.98765',
            n2o: '1.78901',
          },
          emissionsWithinUKPorts: {
            ch4: '3.21',
            co2: '125.54321',
            n2o: '0.87654',
          },
          fromFetch: false,
          fuelConsumptions: [
            {
              fuelOriginTypeName: {
                origin: 'FOSSIL',
                type: 'HFO',
                uniqueIdentifier: 'e2b51837-98be-4c79-a9e8-69751dff9347',
              },
              totalConsumption: '1500.25',
            },
            {
              fuelOriginTypeName: {
                origin: 'BIOFUEL',
                type: 'BIO_LNG',
                uniqueIdentifier: '9e5804cc-cd61-4c5a-a092-ae904dd8c1d2',
              },
              totalConsumption: '750.5',
            },
          ],
          imoNumber: '1111111',
          uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
        },
        {
          dataInputType: 'MANUAL',
          emissionsBetweenUKAndNIVoyages: {
            ch4: '8.76543',
            co2: '340.987',
            n2o: '2.34567',
          },
          emissionsBetweenUKPorts: {
            ch4: '4.321',
            co2: '170.654',
            n2o: '1.09876',
          },
          emissionsWithinUKPorts: {
            ch4: '2.1',
            co2: '85.321',
            n2o: '0.54321',
          },
          fromFetch: false,
          fuelConsumptions: [
            {
              fuelOriginTypeName: {
                origin: 'FOSSIL',
                type: 'LNG',
                uniqueIdentifier: 'f4f5f382-f125-4b4f-86dd-934792e022d6',
              },
              totalConsumption: '800.125',
            },
          ],
          imoNumber: '2222222',
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
    const result = service.parse(mockAerAggregatedDataPartialErrorsXml);
    expect(result).toEqual({
      data: [],
      errors: [
        {
          column: 'shipImoNumber',
          message: 'The IMO Number must be 7 digits and is required',
          row: 1,
        },
        {
          column: 'NO_FIELD',
          message: 'The required fields are out of the expected criteria',
          row: 2,
        },
        {
          column: 'NO_FIELD',
          message: 'The required fields are out of the expected criteria',
          row: 3,
        },
      ],
    });
  });
});
