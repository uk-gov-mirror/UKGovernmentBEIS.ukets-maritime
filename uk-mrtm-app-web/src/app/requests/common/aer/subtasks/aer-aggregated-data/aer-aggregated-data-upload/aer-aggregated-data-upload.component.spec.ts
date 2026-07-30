import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { AerAggregatedDataUploadComponent } from '@requests/common/aer/subtasks/aer-aggregated-data';
import {
  AER_AGGREGATED_DATA_SUB_TASK,
  AerAggregatedDataWizardStep,
} from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data.helpers';
import {
  aerAggregatedDataXmlMock,
  aerEmissionsMock,
  mockAerAggregatedDataPartialErrorsXml,
  mockAerStateBuild,
} from '@requests/common/aer/testing';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('AerAggregatedDataUploadComponent', () => {
  let component: AerAggregatedDataUploadComponent;
  let fixture: ComponentFixture<AerAggregatedDataUploadComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
  Object.defineProperty(window, 'crypto', {
    value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
  });

  const createMockFileEvent = (mockFile: File) => ({
    target: {
      files: [mockFile],
      value: 'test',
    },
  });

  const mockInValidFileData = {
    name: 'ships.xml',
    size: 1024,
    type: 'text/xml',
    text: vi.fn().mockResolvedValue(mockAerAggregatedDataPartialErrorsXml),
  } as unknown as File;

  const expectedValidationErrors = [
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
  ];

  const mockValidFileData = {
    name: 'ships.xml',
    size: 1024,
    type: 'text/xml',
    text: vi.fn().mockResolvedValue(aerAggregatedDataXmlMock),
  } as unknown as File;

  const expectedValidAggregatedData = [
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
  ];

  const expectedValidAggregatedTableData = [
    {
      imoNumber: '1111111',
      name: 'SameMonitoringMethod',
    },
    {
      imoNumber: '2222222',
      name: 'SameMonitoringMethod',
    },
  ];
  const expectedValidTableContents = [
    'IMO number',
    'Name',
    '1111111',
    'SameMonitoringMethod',
    '2222222',
    'SameMonitoringMethod',
  ];

  const route = new ActivatedRouteStub();

  const taskService: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };

  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');

  class Page extends BasePage<AerAggregatedDataUploadComponent> {
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AerAggregatedDataUploadComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();

    store = TestBed.inject(RequestTaskStore);
    store.setState(mockAerStateBuild({ emissions: aerEmissionsMock }, { emissions: TaskItemStatus.IN_PROGRESS }));
    fixture = TestBed.createComponent(AerAggregatedDataUploadComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements and form with 0 errors', () => {
    expect(page.errorSummary).toBeFalsy();
    expect(page.heading1).toBeTruthy();
    expect(page.heading1.textContent).toEqual('Upload the aggregated data for ships file');
    expect(page.errorSummary).toBeFalsy();
    expect(page.uploadFileButton).toBeTruthy();
    expect(page.submitButton).toBeTruthy();
  });

  it('should handle XML validation errors', async () => {
    await component.onFileSelect(createMockFileEvent(mockInValidFileData));
    fixture.detectChanges();

    expect(component.xmlErrors()).toEqual(expectedValidationErrors);
    expect(component.aggregatedTableData()).toEqual([]);
    expect(component.shipEmissionsList()).toEqual([]);
    expect(page.errorSummaryListContents).toEqual([]);
  });

  it('should parse XML, update ship lists and submit form when valid XML is uploaded', async () => {
    await component.onFileSelect(createMockFileEvent(mockValidFileData));
    fixture.detectChanges();

    expect(component.xmlErrors()).toEqual([]);
    expect(component.aggregatedTableData()).toEqual(expectedValidAggregatedTableData);
    expect(component.shipEmissionsList()).toEqual(expectedValidAggregatedData);
    expect(page.tableContents).toEqual(expectedValidTableContents);

    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      AER_AGGREGATED_DATA_SUB_TASK,
      AerAggregatedDataWizardStep.UPLOAD_AGGREGATED_DATA,
      route,
      expectedValidAggregatedData,
    );
  });
});
