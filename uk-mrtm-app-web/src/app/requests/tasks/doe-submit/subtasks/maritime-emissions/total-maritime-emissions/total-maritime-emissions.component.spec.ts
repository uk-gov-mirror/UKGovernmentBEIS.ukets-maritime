import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { RequestTaskAttachmentsHandlingService } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, asyncData, BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import { taskProviders } from '@requests/common/task.providers';
import {
  MARITIME_EMISSIONS_SUB_TASK,
  MaritimeEmissionsWizardStep,
} from '@requests/tasks/doe-submit/subtasks/maritime-emissions';
import { TotalMaritimeEmissionsComponent } from '@requests/tasks/doe-submit/subtasks/maritime-emissions/total-maritime-emissions';
import {
  mockDoeMaritimeEmissions,
  mockDoeSubmitSubmitRequestTask,
  mockStateBuild,
} from '@requests/tasks/doe-submit/testing/doe-submit-data.mock';

describe('TotalMaritimeEmissionsComponent', () => {
  let component: TotalMaritimeEmissionsComponent;
  let fixture: ComponentFixture<TotalMaritimeEmissionsComponent>;
  let page: Page;
  let store: RequestTaskStore;
  let supportingDocumentsControl: FormControl;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<any>> = { saveSubtask: vi.fn().mockReturnValue(of({})) };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');
  const uuid3 = '33333333-3333-4333-a333-333333333333';
  const uuid4 = '44444444-4444-4444-a444-444444444444';
  const attachmentService: MockType<RequestTaskAttachmentsHandlingService> = {
    uploadRequestTaskAttachment: vi.fn().mockReturnValue(asyncData<any>(new HttpResponse({ body: { uuid: uuid4 } }))),
  };

  class Page extends BasePage<TotalMaritimeEmissionsComponent> {
    get determinationTypeRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="determinationType"]');
    }

    set totalReportableEmissions(value: number) {
      this.setInputValue(`#totalReportableEmissions`, value);
    }

    set lessVoyagesInNorthernIrelandDeduction(value: number) {
      this.setInputValue(`#lessVoyagesInNorthernIrelandDeduction`, value);
    }

    set surrenderEmissions(value: number) {
      this.setInputValue(`#surrenderEmissions`, value);
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(TotalMaritimeEmissionsComponent);
    component = fixture.componentInstance;
    supportingDocumentsControl = component['form'].get('supportingDocuments') as FormControl;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalMaritimeEmissionsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        { provide: RequestTaskAttachmentsHandlingService, useValue: attachmentService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new total maritime emissions', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockDoeSubmitSubmitRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual(
        'Determination of maritime emissions or emissions figure for surrender',
      );
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(5);
      expect(page.errorSummaryListContents).toEqual([
        'Select if you are determining maritime emissions or only the emissions figure for surrender',
        'Enter the total maritime emissions',
        'Enter the Northern Ireland surrender deduction',
        'Enter the emissions figure for surrender',
        'Enter how you calculated the emissions',
      ]);
    });
  });

  describe('for existing total maritime emissions', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(
        mockStateBuild(
          { maritimeEmissions: mockDoeMaritimeEmissions },
          { maritimeEmissions: TaskItemStatus.IN_PROGRESS },
          { '11111111-1111-4111-a111-111111111111': '100.png' },
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
        'Determination of maritime emissions or emissions figure for surrender',
      );
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      expect(page.filesText).toEqual(['100.png']);

      page.determinationTypeRadios[0].click();
      page.totalReportableEmissions = 5;
      page.lessVoyagesInNorthernIrelandDeduction = 4;
      page.surrenderEmissions = 3;
      page.fileDeleteButtons[0].click();
      supportingDocumentsControl.setValue([{ file: new File(['test content 3'], 'testfile3.jpg'), uuid: uuid3 }]);
      page.filesValue = [new File(['test content 4'], 'testfile4.jpg')];
      await fixture.whenStable();
      fixture.detectChanges();

      expect(page.filesText).toEqual(['testfile3.jpg', 'testfile4.jpg has been uploaded']);
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        MARITIME_EMISSIONS_SUB_TASK,
        MaritimeEmissionsWizardStep.TOTAL_MARITIME_EMISSIONS,
        route,
        {
          determinationType: 'MARITIME_EMISSIONS',
          totalReportableEmissions: 5,
          lessVoyagesInNorthernIrelandDeduction: 4,
          surrenderEmissions: 3,
          calculationApproach: 'test another data source',
          supportingDocuments: [
            { file: new File([''], 'filename'), uuid: uuid3 },
            { file: new File([''], 'filename'), uuid: uuid4 },
          ],
        },
      );
    });
  });
});
