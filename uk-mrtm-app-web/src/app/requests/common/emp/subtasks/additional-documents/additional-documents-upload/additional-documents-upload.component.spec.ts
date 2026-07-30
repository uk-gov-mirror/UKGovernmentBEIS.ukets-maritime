import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { RequestTaskAttachmentsHandlingService } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, asyncData, BasePage, MockType } from '@netz/common/testing';

import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { AdditionalDocumentsUploadComponent } from '@requests/common/emp/subtasks/additional-documents';
import {
  mockAdditionalDocuments,
  mockEmpIssuanceSubmitRequestTask,
  mockStateBuild,
} from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import {
  ADDITIONAL_DOCUMENTS_SUB_TASK,
  AdditionalDocumentsWizardStep,
} from '@requests/common/utils/additional-documents';

describe('AdditionalDocumentsUploadComponent', () => {
  let component: AdditionalDocumentsUploadComponent;
  let fixture: ComponentFixture<AdditionalDocumentsUploadComponent>;
  let page: Page;
  let store: RequestTaskStore;
  let control: FormControl;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<EmpTaskPayload>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');
  const uuid3 = '33333333-3333-4333-a333-333333333333';
  const uuid4 = '44444444-4444-4444-a444-444444444444';
  const attachmentService: MockType<RequestTaskAttachmentsHandlingService> = {
    uploadRequestTaskAttachment: vi.fn().mockReturnValue(asyncData<any>(new HttpResponse({ body: { uuid: uuid4 } }))),
  };

  class Page extends BasePage<AdditionalDocumentsUploadComponent> {
    get existRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="exist"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(AdditionalDocumentsUploadComponent);
    component = fixture.componentInstance;
    control = component['form'].get('documents') as FormControl;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalDocumentsUploadComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        { provide: RequestTaskAttachmentsHandlingService, useValue: attachmentService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new additional-documents-upload', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockEmpIssuanceSubmitRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual(
        'Do you want to upload any additional documents or information to support your application?',
      );
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(1);
      expect(page.errorSummaryListContents).toEqual([
        'Select ‘Yes’, if you want to upload any additional documents or information to support your application',
      ]);
    });
  });

  describe('for existing additional-documents-upload', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(
        mockStateBuild(
          { additionalDocuments: mockAdditionalDocuments },
          { additionalDocuments: TaskItemStatus.IN_PROGRESS },
          {
            '11111111-1111-4111-a111-111111111111': '100.png',
          },
        ),
      );
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual(
        'Do you want to upload any additional documents or information to support your application?',
      );
      expect(page.existRadios[0].checked).toBeTruthy();
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      expect(page.filesText).toEqual(['100.png']);

      page.fileDeleteButtons[0].click();
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummaryListContents).toEqual(['Select a file']);

      control.setValue([{ file: new File(['test content 3'], 'testfile3.jpg'), uuid: uuid3 }]);
      page.filesValue = [new File(['test content 4'], 'testfile4.jpg')];
      await fixture.whenStable();
      fixture.detectChanges();

      expect(page.filesText).toEqual(['testfile3.jpg', 'testfile4.jpg has been uploaded']);
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        ADDITIONAL_DOCUMENTS_SUB_TASK,
        AdditionalDocumentsWizardStep.ADDITIONAL_DOCUMENTS_UPLOAD,
        route,
        {
          ...mockAdditionalDocuments,
          documents: [
            {
              file: new File([''], 'filename'),
              uuid: uuid3,
            },
            {
              file: new File([''], 'filename'),
              uuid: uuid4,
            },
          ],
        },
      );
    });

    it(`should submit a valid form`, async () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        ADDITIONAL_DOCUMENTS_SUB_TASK,
        AdditionalDocumentsWizardStep.ADDITIONAL_DOCUMENTS_UPLOAD,
        route,
        {
          ...mockAdditionalDocuments,
          documents: [
            {
              file: {
                name: '100.png',
              },
              uuid: mockAdditionalDocuments.documents[0],
            },
          ],
        },
      );
    });
  });
});
