import {
  AdditionalDocuments,
  AerAggregatedData,
  AerApplicationSubmittedRequestActionPayload,
  AerEmissions,
  AerFuelsAndEmissionsFactors,
  AerMonitoringPlanChanges,
  AerOperatorDetails,
  AerPortEmissions,
  AerSmf,
  AerTotalEmissions,
  AerVoyageEmissions,
  FuelOriginTypeName,
  OrganisationStructure,
  RequestActionDTO,
} from '@mrtm/api';

import { RequestActionState } from '@netz/common/store';

const mockAerOperatorDetails: AerOperatorDetails = {
  operatorName: 'OperatorAccount1',
  imoNumber: '1111119',
  contactAddress: {
    line1: 'Some address',
    city: 'London',
    country: 'GB',
    postcode: 'HY56 BS73',
    state: 'Cardiff',
  },
  organisationStructure: {
    legalStatusType: 'LIMITED_COMPANY',
    registeredAddress: {
      line1: 'Some address registered',
      line2: 'Some 2nd address',
      city: 'London',
      country: 'GB',
      postcode: 'HU54 32',
      state: 'Cardiff',
    },
    registrationNumber: 'Company',
    evidenceFiles: ['22222222-2222-4222-a222-222222222222'],
  } as OrganisationStructure,
};

const mockAdditionalDocuments: AdditionalDocuments = {
  exist: true,
  documents: ['44444444-4444-4444-a444-444444444444', '33333333-3333-4333-a333-333333333333'],
};

const mockAerEmissions: AerEmissions = {
  ships: [
    {
      dataInputType: 'MANUAL',
      details: {
        imoNumber: '1111111',
        name: 'Ever Green',
        type: 'PAX',
        grossTonnage: 5000,
        flagState: 'GB',
        iceClass: 'PC1',
        natureOfReportingResponsibility: 'SHIPOWNER',
        allYear: true,
      },
      uniqueIdentifier: '84a503d5-20e9-47db-8867-287508d8fa2f',
      fuelsAndEmissionsFactors: [
        {
          origin: 'FOSSIL',
          carbonDioxide: '3.114',
          methane: '0.00005',
          nitrousOxide: '0.00018',
          uniqueIdentifier: 'c6c9ddaa-9c5a-425b-a674-56858ff8e676',
          type: 'HFO',
        } as AerFuelsAndEmissionsFactors,
        {
          origin: 'FOSSIL',
          carbonDioxide: '2.75',
          methane: '0',
          nitrousOxide: '0.00011',
          uniqueIdentifier: '231060c5-5261-4725-8f47-b62909ea341d',
          type: 'LNG',
        } as AerFuelsAndEmissionsFactors,
        {
          origin: 'BIOFUEL',
          name: 'SomeOtherBioFuel',
          carbonDioxide: '3.115',
          methane: '0.00005',
          nitrousOxide: '0.00018',
          uniqueIdentifier: '9fcbcd03-89e3-44d4-b54a-8cfd3586208b',
          type: 'OTHER',
        } as AerFuelsAndEmissionsFactors,
        {
          origin: 'RFNBO',
          carbonDioxide: '3.206',
          methane: '0.00005',
          nitrousOxide: '0.00018',
          uniqueIdentifier: '40302c7a-b7d4-4520-9209-9f17a8b91d28',
          type: 'E_DIESEL',
        } as AerFuelsAndEmissionsFactors,
      ],
      emissionsSources: [
        {
          name: 'Main Engine 1',
          type: 'MAIN_ENGINE',
          sourceClass: 'BOILERS',
          fuelDetails: [
            {
              origin: 'FOSSIL',
              uniqueIdentifier: 'c6c9ddaa-9c5a-425b-a674-56858ff8e676',
              type: 'HFO',
            } as FuelOriginTypeName,
            {
              origin: 'FOSSIL',
              uniqueIdentifier: '231060c5-5261-4725-8f47-b62909ea341d',
              methaneSlip: '3.1',
              methaneSlipValueType: 'PRESELECTED',
              type: 'LNG',
            } as FuelOriginTypeName,
            {
              origin: 'BIOFUEL',
              name: 'SomeOtherBioFuel',
              uniqueIdentifier: '9fcbcd03-89e3-44d4-b54a-8cfd3586208b',
              methaneSlip: '0.2',
              methaneSlipValueType: 'PRESELECTED',
              type: 'OTHER',
            } as FuelOriginTypeName,
          ],
          monitoringMethod: ['BUNKER_TANK', 'BDN'],
          uniqueIdentifier: 'be9a7c8a-643b-4af1-b8c3-98c781197f18',
        },
        {
          name: 'Aux Engine 1',
          type: 'AUX_ENGINE',
          sourceClass: 'BOILERS',
          fuelDetails: [
            {
              origin: 'RFNBO',
              uniqueIdentifier: '40302c7a-b7d4-4520-9209-9f17a8b91d28',
              type: 'E_DIESEL',
            } as FuelOriginTypeName,
          ],
          monitoringMethod: ['DIRECT', 'FLOW_METERS', 'BDN'],
          uniqueIdentifier: 'ac8f5bfb-44bf-4ecb-8e30-3d9cbb5a0ee3',
        },
      ],
      uncertaintyLevel: [
        {
          monitoringMethod: 'BDN',
          methodApproach: 'DEFAULT',
          value: '7.5',
        },
        {
          monitoringMethod: 'BUNKER_TANK',
          methodApproach: 'SHIP_SPECIFIC',
          value: '2',
        },
        {
          monitoringMethod: 'FLOW_METERS',
          methodApproach: 'DEFAULT',
          value: '7.5',
        },
        {
          monitoringMethod: 'DIRECT',
          methodApproach: 'SHIP_SPECIFIC',
          value: '2',
        },
      ],
      derogations: {
        exceptionFromPerVoyageMonitoring: false,
      },
    },
  ],
};

const mockMonitoringPlanChanges: AerMonitoringPlanChanges = {
  changesExist: true,
  changes: 'sdfgg',
};

const mockAerPortEmissions: AerPortEmissions = {
  ports: [
    {
      uniqueIdentifier: '08ba9667-5e46-4fa8-aa17-2b6e1f3fa208',
      imoNumber: '1111111',
      portDetails: {
        arrivalTime: '2022-01-15T16:00:00Z',
        departureTime: '2022-01-20T17:00:00Z',
        visit: {
          country: 'GR',
          port: 'GRPIR',
        },
      },
      fuelConsumptions: [
        {
          uniqueIdentifier: 'dd5d91b0-d81d-48f8-8acd-9a7f3157065a',
          fuelOriginTypeName: {
            origin: 'FOSSIL',
            uniqueIdentifier: '231060c5-5261-4725-8f47-b62909ea341d',
            methaneSlip: '3.1',
            type: 'LNG',
          } as FuelOriginTypeName,
          name: 'Main Engine 1',
          amount: '14',
          measuringUnit: 'M3',
          fuelDensity: '1',
          totalConsumption: '14.00000',
        },
      ],
      directEmissions: {
        co2: '3',
        ch4: '1',
        n2o: '1',
        total: '5.0000000',
      },
      totalEmissions: {
        co2: '40.3065000',
        ch4: '13.9332000',
        n2o: '1.4073870',
        total: '55.6470870',
      },
      surrenderEmissions: {
        co2: '0.0000000',
        ch4: '0.0000000',
        n2o: '0.0000000',
        total: '0.0000000',
      },
    },
  ],
};

const mockAerVoyageEmissions: AerVoyageEmissions = {
  voyages: [
    {
      uniqueIdentifier: 'be49b79b-675c-4a5e-aaa4-2af0ad3ff3f9',
      imoNumber: '1111111',
      voyageDetails: {
        arrivalTime: '2022-02-04T22:00:00Z',
        departureTime: '2022-02-02T13:00:00Z',
        arrivalPort: {
          country: 'GB',
          port: 'GBSOU',
        },
        departurePort: {
          country: 'GB',
          port: 'GBABD',
        },
      },
      fuelConsumptions: [
        {
          uniqueIdentifier: '1e60e827-1a73-4c4c-a3d7-a06965373876',
          fuelOriginTypeName: {
            origin: 'FOSSIL',
            uniqueIdentifier: 'c6c9ddaa-9c5a-425b-a674-56858ff8e676',
            type: 'HFO',
          } as FuelOriginTypeName,
          name: 'Main Engine 1',
          amount: '10',
          measuringUnit: 'M3',
          fuelDensity: '1',
          totalConsumption: '10.00000',
        },
      ],
      directEmissions: {
        co2: '1',
        ch4: '1',
        n2o: '1',
        total: '3.0000000',
      },
      totalEmissions: {
        co2: '32.1400000',
        ch4: '1.0149000',
        n2o: '1.4914000',
        total: '34.6463000',
      },
      surrenderEmissions: {
        co2: '30.5330000',
        ch4: '0.9641550',
        n2o: '1.4168300',
        total: '32.9139850',
      },
    },
  ],
};

const mockAerAggregatedData: AerAggregatedData = {
  emissions: [
    {
      dataInputType: 'MANUAL',
      uniqueIdentifier: '654914f2-43c1-4c23-a927-7504889a57b9',
      imoNumber: '1111111',
      fuelConsumptions: [
        {
          fuelOriginTypeName: {
            origin: 'FOSSIL',
            uniqueIdentifier: '231060c5-5261-4725-8f47-b62909ea341d',
            type: 'LNG',
          } as FuelOriginTypeName,
          totalConsumption: '14.00000',
        },
        {
          fuelOriginTypeName: {
            origin: 'FOSSIL',
            uniqueIdentifier: 'c6c9ddaa-9c5a-425b-a674-56858ff8e676',
            type: 'HFO',
          } as FuelOriginTypeName,
          totalConsumption: '10.00000',
        },
      ],
      emissionsWithinUKPorts: {
        co2: '40.3065000',
        ch4: '13.9332000',
        n2o: '1.4073870',
        total: '55.6470870',
      },
      emissionsBetweenUKPorts: {
        co2: '32.1400000',
        ch4: '1.0149000',
        n2o: '1.4914000',
        total: '34.6463000',
      },
      emissionsBetweenUKAndNIVoyages: {
        co2: '0',
        ch4: '0',
        n2o: '0',
        total: '0.0000000',
      },
      totalEmissionsFromVoyagesAndPorts: {
        co2: '72.4465000',
        ch4: '14.9481000',
        n2o: '2.8987870',
        total: '90.2933870',
      },
      lessVoyagesInNorthernIrelandDeduction: {
        co2: '72.4465000',
        ch4: '14.9481000',
        n2o: '2.8987870',
        total: '90.2933870',
      },
      totalShipEmissions: '90.2933870',
      surrenderEmissions: '32.9139850',
      fromFetch: true,
    },
  ],
};

const mockSmf: AerSmf = {
  exist: true,
  smfDetails: {
    purchases: [
      {
        dataInputType: 'MANUAL',
        uniqueIdentifier: 'c6c9ddaa-9c5a-425b-a674-56858ff8e671',
        fuelOriginTypeName: {
          origin: 'FOSSIL',
          uniqueIdentifier: 'c6c9ddaa-9c5a-425b-a674-56858ff8e676',
          type: 'HFO',
        } as FuelOriginTypeName,
        batchNumber: '1234',
        smfMass: '0.02',
        co2EmissionFactor: '1',
        co2Emissions: '0.0200000',
        evidenceFiles: ['11111111-1111-4111-a111-111111111111'],
      },
    ],
    totalSustainableEmissions: '0.0200000',
  },
};

const mockAerTotalEmissions: AerTotalEmissions = {
  totalEmissions: {
    co2: '72.4465000',
    ch4: '14.9481000',
    n2o: '2.8987870',
    total: '90.2933870',
  },
  lessVoyagesInNorthernIrelandDeduction: {
    co2: '72.4465000',
    ch4: '14.9481000',
    n2o: '2.8987870',
    total: '90.2933870',
  },
  lessEmissionsReductionClaim: {
    co2: '72.4265000',
    ch4: '14.9481000',
    n2o: '2.8987870',
    total: '90.2733870',
  },
  totalShipEmissions: '90.2733870',
  surrenderEmissions: '32.8949850',
  totalShipEmissionsSummary: '90',
  surrenderEmissionsSummary: '33',
};

export const mockAerSubmittedPayload: AerApplicationSubmittedRequestActionPayload = {
  payloadType: 'AER_APPLICATION_SUBMITTED_PAYLOAD',
  reportingRequired: true,
  aer: {
    operatorDetails: mockAerOperatorDetails,
    additionalDocuments: mockAdditionalDocuments,
    emissions: mockAerEmissions,
    aerMonitoringPlanChanges: mockMonitoringPlanChanges,
    portEmissions: mockAerPortEmissions,
    voyageEmissions: mockAerVoyageEmissions,
    aggregatedData: mockAerAggregatedData,
    smf: mockSmf,
    totalEmissions: mockAerTotalEmissions,
  },
  reportingYear: 2022,
  verificationPerformed: false,
  aerAttachments: {
    '11111111-1111-4111-a111-111111111111': '1.png',
    '22222222-2222-4222-a222-222222222222': '2.png',
    '33333333-3333-4333-a333-333333333333': '3.png',
    '44444444-4444-4444-a444-444444444444': '4.png',
  },
  verificationAttachments: {},
};

export const mockRequestActionAerSubmittedState: RequestActionState = {
  action: {
    id: 1,
    type: 'AER_APPLICATION_SENT_TO_VERIFIER',
    payload: mockAerSubmittedPayload,
    requestId: 'MAR00009-2022',
    requestType: 'AER',
    requestAccountId: 1,
    competentAuthority: 'ENGLAND',
    submitter: 'Operator1 England',
    creationDate: '2024-04-29T11:26:48.735269Z',
  } as RequestActionDTO,
};
