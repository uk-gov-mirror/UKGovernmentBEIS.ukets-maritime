import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { AER_PORTS_SUB_TASK, AerPortsWizardStep } from '@requests/common/aer/subtasks/aer-ports/aer-ports.helpers';
import { AerPortsUploadComponent } from '@requests/common/aer/subtasks/aer-ports/aer-ports-upload/aer-ports-upload.component';
import {
  aerEmissionsMock,
  mockAerPortsCsvErrorPapaResult,
  mockAerPortsCsvSuccessPapaResult,
  mockAerStateBuild,
} from '@requests/common/aer/testing';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('AerPortsUploadComponent', () => {
  let component: AerPortsUploadComponent;
  let fixture: ComponentFixture<AerPortsUploadComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };

  class Page extends BasePage<AerPortsUploadComponent> {
    get paragraphs(): HTMLParagraphElement[] {
      return this.queryAll<HTMLParagraphElement>('p.govuk-body');
    }

    get errorTitles() {
      return this.queryAll<HTMLParagraphElement>('.govuk-error-summary__list li p');
    }

    get uploadFileButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button.govuk-button--secondary');
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AerPortsUploadComponent],
      providers: [
        RequestTaskStore,
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();

    store = TestBed.inject(RequestTaskStore);
    store.setState(mockAerStateBuild({ emissions: aerEmissionsMock }, { emissions: TaskItemStatus.IN_PROGRESS }));
    fixture = TestBed.createComponent(AerPortsUploadComponent);
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
    expect(page.heading1.textContent).toEqual('Upload the ports and emission details file');
    expect(page.paragraphs).toHaveLength(4);
    expect(page.uploadFileButton).toBeTruthy();
    expect(page.submitButton).toBeTruthy();
  });

  it('should display CSV field errors', () => {
    component['processCSVData'](mockAerPortsCsvErrorPapaResult);
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errorTitles.map((item) => item.textContent.trim())).toEqual([
      "The field 'IMO Number' is required",
      "Check the data in column 'IMO Number' on row(s) 2",
      "The field 'Country code of port' has invalid or missing values",
      "Check the data in column 'Country code of port' on row(s) 2",
      "The field 'Port code' has invalid or missing values",
      "Check the data in column 'Port code' on row(s) 2",
      "The field 'Date of arrival' has invalid or missing values",
      "Check the data in column 'Date of arrival' on row(s) 2",
      "The field 'Date of arrival' must be before the 'Date of departure'",
      "Check the data in column 'Date of arrival' on row(s) 2",
      "The field 'Actual time of arrival (ATA)' has invalid or missing values",
      "Check the data in column 'Actual time of arrival (ATA)' on row(s) 2",
      "The field 'Date of departure' has invalid or missing values",
      "Check the data in column 'Date of departure' on row(s) 2",
      "The field 'Date of departure' must be after the 'Date of arrival'",
      "Check the data in column 'Date of departure' on row(s) 2",
      "The field 'Actual time of departure (ATD)' has invalid or missing values",
      "Check the data in column 'Actual time of departure (ATD)' on row(s) 2",
      'The ship has not recorded any emissions for one or more ports',
      'Check the data on row(s) 2',
      'Upload the ports and emission details file',
    ]);
  });

  it('should not display any error when CSV is valid and submit a valid form', async () => {
    const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
    });
    const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');
    expect(page.errorSummary).toBeFalsy();

    component['processCSVData'](mockAerPortsCsvSuccessPapaResult);
    component.fileCtrl.setErrors(null);
    fixture.detectChanges();
    expect(page.errorSummary).toBeFalsy();

    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeFalsy();
    expect(taskServiceSpy).toHaveBeenCalledWith(AER_PORTS_SUB_TASK, AerPortsWizardStep.UPLOAD_PORTS, route, [
      {
        imoNumber: '1111111',
        uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
        portDetails: {
          visit: {
            country: 'GB',
            port: 'GBABD',
          },
          arrivalTime: '2025-02-01T10:00:00Z',
          departureTime: '2025-02-02T16:00:00Z',
        },
        fuelConsumptions: [
          {
            amount: '1',
            fuelDensity: '0.8',
            fuelOriginTypeName: {
              methaneSlip: '3.1',
              name: undefined,
              origin: 'BIOFUEL',
              type: 'BIO_LNG',
              uniqueIdentifier: '9e5804cc-cd61-4c5a-a092-ae904dd8c1d2',
            },
            measuringUnit: 'M3',
            name: 'Boiler 1',
            uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
          },
        ],
        directEmissions: {
          ch4: '44.4',
          co2: '33.3',
          n2o: '55.5',
          total: '133.2',
        },
      },
    ]);
  });
});
