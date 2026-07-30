import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { AerVoyageUploadComponent } from '@requests/common/aer/subtasks/aer-voyages';
import {
  AER_VOYAGES_SUB_TASK,
  AerVoyagesWizardStep,
} from '@requests/common/aer/subtasks/aer-voyages/aer-voyages.helpers';
import {
  aerEmissionsMock,
  mockAerStateBuild,
  mockAerVoyagesCsvErrorPapaResult,
  mockAerVoyagesCsvSuccessPapaResult,
} from '@requests/common/aer/testing';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('AerVoyageUploadComponent', () => {
  let component: AerVoyageUploadComponent;
  let fixture: ComponentFixture<AerVoyageUploadComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };

  class Page extends BasePage<AerVoyageUploadComponent> {
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
      imports: [AerVoyageUploadComponent],
      providers: [
        RequestTaskStore,
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();

    store = TestBed.inject(RequestTaskStore);
    store.setState(mockAerStateBuild({ emissions: aerEmissionsMock }, { emissions: TaskItemStatus.IN_PROGRESS }));
    fixture = TestBed.createComponent(AerVoyageUploadComponent);
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
    expect(page.heading1.textContent).toEqual('Upload the voyages and emission details file');
    expect(page.paragraphs).toHaveLength(4);
    expect(page.uploadFileButton).toBeTruthy();
    expect(page.submitButton).toBeTruthy();
  });

  it('should display CSV field errors', () => {
    component['processCSVData'](mockAerVoyagesCsvErrorPapaResult);
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errorTitles.map((item) => item.textContent.trim())).toEqual([
      "The field 'IMO Number' is required",
      "Check the data in column 'IMO Number' on row(s) 2",
      "The field 'Country code of departure' has invalid or missing values",
      "Check the data in column 'Country code of departure' on row(s) 2",
      "The field 'Port code of departure' has invalid or missing values",
      "Check the data in column 'Port code of departure' on row(s) 2",
      "The field 'Date of departure' has invalid or missing values",
      "Check the data in column 'Date of departure' on row(s) 2",
      "The field 'Date of departure' must be before the 'Date of arrival'",
      "Check the data in column 'Date of departure' on row(s) 2",
      "The field 'Actual time of departure (ATD)' has invalid or missing values",
      "Check the data in column 'Actual time of departure (ATD)' on row(s) 2",
      "The field 'Country code of arrival' has invalid or missing values",
      "Check the data in column 'Country code of arrival' on row(s) 2",
      "The field 'Port code of arrival' has invalid or missing values",
      "Check the data in column 'Port code of arrival' on row(s) 2",
      "The field 'Date of arrival' has invalid or missing values",
      "Check the data in column 'Date of arrival' on row(s) 2",
      "The field 'Date of arrival' must be after the 'Date of departure'",
      "Check the data in column 'Date of arrival' on row(s) 2",
      "The field 'Actual time of arrival (ATA)' has invalid or missing values",
      "Check the data in column 'Actual time of arrival (ATA)' on row(s) 2",
      'The ship has not recorded any emissions for one or more voyages',
      'Check the data on row(s) 2',
      'Upload the voyages and emission details file',
    ]);
  });

  it('should not display any error when CSV is valid and submit a valid form', async () => {
    const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
    });
    const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');
    expect(page.errorSummary).toBeFalsy();

    component['processCSVData'](mockAerVoyagesCsvSuccessPapaResult);
    component.fileCtrl.setErrors(null);
    fixture.detectChanges();
    expect(page.errorSummary).toBeFalsy();

    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeFalsy();
    expect(taskServiceSpy).toHaveBeenCalledWith(AER_VOYAGES_SUB_TASK, AerVoyagesWizardStep.UPLOAD_VOYAGES, route, [
      {
        directEmissions: { ch4: '44.444', co2: '33.333', n2o: '55.555', total: '133.332' },
        fuelConsumptions: [
          {
            amount: '100',
            fuelDensity: '1',
            fuelOriginTypeName: {
              methaneSlip: '0.2',
              name: 'Custom Fuel 1',
              origin: 'FOSSIL',
              type: 'OTHER',
              uniqueIdentifier: '146147de-af0d-47da-8f95-b7967ba093d0',
            },
            measuringUnit: 'M3',
            name: 'Boiler 1',
            uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
          },
        ],
        imoNumber: '1111111',
        uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
        voyageDetails: {
          arrivalPort: { country: 'GB', port: 'GBARD' },
          arrivalTime: '2025-01-03T16:04:00Z',
          departurePort: { country: 'GB', port: 'GBABD' },
          departureTime: '2025-01-01T01:04:00Z',
        },
      },
    ]);
  });
});
