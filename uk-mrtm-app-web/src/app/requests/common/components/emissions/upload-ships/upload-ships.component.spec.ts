import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { REQUEST_TASK_COMMON_SUBTASK_STEPS_QUERY } from '@requests/+state';
import { aerCommonSubtaskStepsQuery } from '@requests/common/aer/+state';
import { AerShipsXmlService } from '@requests/common/aer/subtasks/aer-emissions/services';
import {
  aerShipsXmlMock,
  mockAerApplicationSubmitRequestTask,
  mockAerShipsPartialErrorsXml,
} from '@requests/common/aer/testing';
import { EMISSIONS_SUB_TASK, UPLOAD_SHIPS_STEP } from '@requests/common/components/emissions/emissions.helpers';
import { UploadShipsComponent } from '@requests/common/components/emissions/upload-ships/upload-ships.component';
import { UPLOAD_SHIPS_XML_SERVICE } from '@requests/common/components/emissions/upload-ships/upload-ships-xml-service.token';
import { empCommonSubtaskStepsQuery } from '@requests/common/emp/+state';
import { EmpShipsXmlService } from '@requests/common/emp/subtasks/emissions/services';
import { mockEmpIssuanceSubmitRequestTask } from '@requests/common/emp/testing/emp-data.mock';
import { mockEmpShipsCoreErrorsXml, mockEmpShipsXml } from '@requests/common/emp/testing/emp-ship-xml.mock';
import { taskProviders } from '@requests/common/task.providers';

describe('UploadShipsComponent', () => {
  let component: UploadShipsComponent;
  let fixture: ComponentFixture<UploadShipsComponent>;
  let store: RequestTaskStore;
  let page: Page;

  const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
  Object.defineProperty(window, 'crypto', {
    value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
  });

  const createMockFileEvent = (xml: any) => ({
    target: {
      files: [
        {
          name: 'ships.xml',
          size: 1024,
          type: 'text/xml',
          text: vi.fn().mockResolvedValue(xml),
        },
      ],
      value: 'test',
    },
  });

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');

  class Page extends BasePage<UploadShipsComponent> {
    get tableContents(): string[] {
      return this.queryAll<HTMLTableCaptionElement>('th, td').map((item) => item.textContent.trim());
    }

    get uploadFileButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button.govuk-button--secondary');
    }

    get file() {
      return this.query<HTMLInputElement>('input').files.item(0);
    }

    set file(file: File) {
      this.setInputValue('input', file ?? []);
    }
  }

  const expectedValidationErrors = [
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
  ];

  const expectedAerValidationErrors = [
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
  ];

  const expectedValidEmpEmissions = [
    {
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
      carbonCapture: {
        exist: true,
        technologies: {
          description: 'string',
          technologyEmissionSources: ['Main Engine 1'],
        },
      },
      exemptionConditions: {
        exist: true,
        minVoyages: 301,
      },
      uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
    },
  ];

  const expectedValidAerEmissions = [
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
  ];

  const createComponent = async (specificProviders, mockRequestTaskState) => {
    await TestBed.configureTestingModule({
      imports: [UploadShipsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
        ...specificProviders,
      ],
    }).compileComponents();

    store = TestBed.inject(RequestTaskStore);
    store.setState(mockRequestTaskState);

    fixture = TestBed.createComponent(UploadShipsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  };

  describe('for EMP', () => {
    beforeEach(() => {
      createComponent(
        [
          { provide: REQUEST_TASK_COMMON_SUBTASK_STEPS_QUERY, useValue: empCommonSubtaskStepsQuery },
          { provide: UPLOAD_SHIPS_XML_SERVICE, useClass: EmpShipsXmlService },
        ],
        mockEmpIssuanceSubmitRequestTask,
      );
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Upload the ships and emission details file');
      expect(page.errorSummary).toBeFalsy();
      expect(page.uploadFileButton).toBeTruthy();
      expect(page.submitButton).toBeTruthy();
    });

    it('should handle XML validation errors', async () => {
      await component.onFileSelect(createMockFileEvent(mockEmpShipsCoreErrorsXml));
      fixture.detectChanges();

      expect(component.xmlErrors()).toEqual(expectedValidationErrors);
      expect(component.shipEmissionListItems()).toEqual([]);
      expect(component.listOfShips()).toEqual([]);
      expect(page.errorSummaryListContents).toEqual([]);
    });

    it('should parse XML, update ship lists and submit form when valid XML is uploaded', async () => {
      await component.onFileSelect(createMockFileEvent(mockEmpShipsXml));
      fixture.detectChanges();

      expect(component.xmlErrors()).toEqual([]);
      expect(component.shipEmissionListItems()).toEqual([
        {
          flagState: 'NO',
          grossTonnage: 5000,
          iceClass: 'IC',
          imoNumber: '2222222',
          name: 'Ever Green',
          natureOfReportingResponsibility: 'ISM_COMPANY',
          type: 'BULK',
          uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
        },
      ]);
      expect(component.listOfShips()).toEqual(expectedValidEmpEmissions);
      expect(page.tableContents).toEqual(['IMO number', 'Name', 'Type', '2222222', 'Ever Green', 'Bulk carrier']);

      page.submitButton.click();
      fixture.detectChanges();

      expect(taskServiceSpy).toHaveBeenCalledWith(
        EMISSIONS_SUB_TASK,
        UPLOAD_SHIPS_STEP,
        route,
        expectedValidEmpEmissions,
      );
    });
  });

  describe('for AER', () => {
    beforeEach(async () => {
      await createComponent(
        [
          { provide: REQUEST_TASK_COMMON_SUBTASK_STEPS_QUERY, useValue: aerCommonSubtaskStepsQuery },
          { provide: UPLOAD_SHIPS_XML_SERVICE, useClass: AerShipsXmlService },
        ],
        mockAerApplicationSubmitRequestTask,
      );
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Upload the ships and emission details file');
      expect(page.errorSummary).toBeFalsy();
      expect(page.uploadFileButton).toBeTruthy();
      expect(page.submitButton).toBeTruthy();
    });

    it('should handle XML validation errors', async () => {
      await component.onFileSelect(createMockFileEvent(mockAerShipsPartialErrorsXml));
      fixture.detectChanges();

      expect(component.xmlErrors()).toEqual(expectedAerValidationErrors);
      expect(component.shipEmissionListItems()).toEqual([]);
      expect(component.listOfShips()).toEqual([]);
      expect(page.errorSummaryListContents).toEqual([]);
    });

    it('should parse XML, update ship lists and submit form when valid XML is uploaded', async () => {
      await component.onFileSelect(createMockFileEvent(aerShipsXmlMock));
      fixture.detectChanges();

      expect(component.xmlErrors()).toEqual([]);
      expect(component.shipEmissionListItems()).toEqual([
        {
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
          uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
        },
        {
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
          uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
        },
      ]);
      expect(component.listOfShips()).toEqual(expectedValidAerEmissions);
      expect(page.tableContents).toEqual([
        'IMO number',
        'Name',
        'Type',
        '1111111',
        'Ship A1',
        'Ro-ro ship',
        '2222222',
        'Ship B1',
        'Oil tanker',
      ]);

      page.submitButton.click();
      fixture.detectChanges();

      expect(taskServiceSpy).toHaveBeenCalledWith(
        EMISSIONS_SUB_TASK,
        UPLOAD_SHIPS_STEP,
        route,
        expectedValidAerEmissions,
      );
    });
  });
});
