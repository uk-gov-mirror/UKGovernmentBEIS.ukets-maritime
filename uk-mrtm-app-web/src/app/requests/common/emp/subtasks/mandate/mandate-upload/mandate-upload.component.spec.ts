import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import { MANDATE_SUB_TASK, MandateWizardStep } from '@requests/common/emp/subtasks/mandate';
import { MandateUploadComponent } from '@requests/common/emp/subtasks/mandate/mandate-upload/mandate-upload.component';
import { emissionsMock } from '@requests/common/emp/testing/emissions.mock';
import { mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import {
  mockMandateCsvErrorPapaResult,
  mockMandateCsvSuccessPapaResult,
} from '@requests/common/emp/testing/mandate-csv.mock';
import { taskProviders } from '@requests/common/task.providers';

describe('MandateUploadComponent', () => {
  let component: MandateUploadComponent;
  let fixture: ComponentFixture<MandateUploadComponent>;
  let page: Page;
  let store: RequestTaskStore;
  let route: ActivatedRoute;

  const taskService: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };

  class Page extends BasePage<MandateUploadComponent> {
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
      imports: [MandateUploadComponent],
      providers: [
        RequestTaskStore,
        provideRouter([]),
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();

    store = TestBed.inject(RequestTaskStore);
    route = TestBed.inject(ActivatedRoute);
    store.setState(mockStateBuild({ emissions: emissionsMock }, { emissions: TaskItemStatus.COMPLETED }));
    fixture = TestBed.createComponent(MandateUploadComponent);
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
    expect(page.heading1.textContent).toEqual('Upload the registered owner file');
    expect(page.paragraphs).toHaveLength(4);
    expect(page.uploadFileButton).toBeTruthy();
    expect(page.submitButton).toBeTruthy();
  });

  it('should display CSV field errors', () => {
    component['processCSVData'](mockMandateCsvErrorPapaResult);
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errorTitles.map((item) => item.textContent.trim())).toEqual([
      'The registered owner name is missing. Enter the registered owner name and reupload the file',
      "Check the data in column 'Registered owner name' on row(s) 2",
      'The IMO number is missing. Enter the IMO number and reupload the file',
      "Check the data in column 'IMO unique company and registered owner identification number' on row(s) 2",
      "The registered owner's contact name is missing. Enter the contact name and reupload the file",
      "Check the data in column 'Contact Name' on row(s) 2",
      'The contact email is missing. Enter the contact email and reupload the file',
      "Check the data in column 'Contact Email' on row(s) 2",
      'The date of written agreement is missing. Enter the date of written agreement and reupload the file',
      "Check the data in column 'Date of written agreement' on row(s) 2",
      'The ship IMO number is missing. Enter the ship IMO number and reupload the file',
      "Check the data in column 'Associated ship IMO number' on row(s) 2",
      'Upload the registered owners file',
    ]);
  });

  it('should not display any error when CSV is valid and submit a valid form', async () => {
    const getFixedUUID = vi.fn().mockReturnValue('11111111-1111-4111-a111-111111111111');
    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
    });
    const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');
    expect(page.errorSummary).toBeFalsy();

    component['processCSVData'](mockMandateCsvSuccessPapaResult);
    component.fileCtrl.setErrors(null);
    fixture.detectChanges();
    expect(page.errorSummary).toBeFalsy();

    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeFalsy();
    expect(taskServiceSpy).toHaveBeenCalledWith(MANDATE_SUB_TASK, MandateWizardStep.UPLOAD_OWNERS, route, [
      {
        contactName: 'RegisteredOwner1',
        effectiveDate: '2025-03-04T00:00:00.000Z',
        email: 'RegisteredOwner1@o.com',
        imoNumber: '1000000',
        name: 'RegisteredOwner1',
        ships: [
          {
            imoNumber: '1111111',
            name: 'EVER GREEN',
          },
        ],
        uniqueIdentifier: '11111111-1111-4111-a111-111111111111',
      },
    ]);
  });
});
