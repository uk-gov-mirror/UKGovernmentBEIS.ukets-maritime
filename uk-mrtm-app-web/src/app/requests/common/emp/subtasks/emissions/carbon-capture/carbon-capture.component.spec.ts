import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { RequestTaskAttachmentsHandlingService } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { asyncData, BasePage, MockType } from '@netz/common/testing';

import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { CarbonCaptureComponent } from '@requests/common/emp/subtasks/emissions/carbon-capture/carbon-capture.component';
import { EmissionsWizardStep } from '@requests/common/emp/subtasks/emissions/emissions.helpers';
import { emissionsMock } from '@requests/common/emp/testing/emissions.mock';
import { mockEmpIssuanceSubmitRequestTask, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('CarbonCaptureComponent', () => {
  let component: CarbonCaptureComponent;
  let fixture: ComponentFixture<CarbonCaptureComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const taskService: MockType<TaskService<EmpTaskPayload>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');
  const route: any = { snapshot: { params: { shipId: emissionsMock.ships[1].uniqueIdentifier }, pathFromRoot: [] } };
  const uuid4 = '44444444-4444-4444-a444-444444444444';
  const attachmentService: MockType<RequestTaskAttachmentsHandlingService> = {
    uploadRequestTaskAttachment: vi.fn().mockReturnValue(asyncData<any>(new HttpResponse({ body: { uuid: uuid4 } }))),
  };

  class Page extends BasePage<CarbonCaptureComponent> {
    get existRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="exist"]');
    }

    set description(value: string) {
      this.setInputValue(`#carbonCapture.technologies.description`, value);
    }

    get technologyEmissionSourcesCheckboxes() {
      return this.queryAll<HTMLInputElement>('.govuk-checkboxes__input');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(CarbonCaptureComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarbonCaptureComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TaskService, useValue: taskService },
        { provide: ActivatedRoute, useValue: route },
        { provide: RequestTaskAttachmentsHandlingService, useValue: attachmentService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new carbon capture question', () => {
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
      expect(page.heading1.textContent).toEqual('Application of carbon capture and storage technologies');
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(1);
      expect(page.errorSummaryListContents).toEqual([
        'Select yes if carbon capture and storage technologies are being applied',
      ]);
    });
  });

  describe('for existing carbon capture question', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(
        mockStateBuild(
          { emissions: emissionsMock },
          { emissions: TaskItemStatus.IN_PROGRESS },
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
      expect(page.heading1.textContent).toEqual('Application of carbon capture and storage technologies');
      expect(page.existRadios[0].checked).toBeFalsy();
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      page.existRadios[0].click();
      fixture.detectChanges();
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummaryListContents).toEqual([
        'Enter a description of the technology that is used for carbon capture and storage',
        'Select the emission source this technology is applied to',
      ]);

      page.description = 'test description';
      page.technologyEmissionSourcesCheckboxes[0].click();
      page.filesValue = [new File(['test content 4'], 'testfile4.jpg')];
      await fixture.whenStable();
      fixture.detectChanges();

      expect(page.filesText).toEqual(['testfile4.jpg has been uploaded']);

      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(EMISSIONS_SUB_TASK, EmissionsWizardStep.CARBON_CAPTURE, route, {
        carbonCapture: {
          exist: true,
          technologies: {
            description: 'test description',
            files: [
              {
                file: new File([''], 'filename'),
                uuid: uuid4,
              },
            ],
            technologyEmissionSources: [emissionsMock.ships[1].emissionsSources[0].name],
          },
        },
        shipId: emissionsMock.ships[1].uniqueIdentifier,
      });
    });

    it(`should submit a valid form`, async () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(EMISSIONS_SUB_TASK, EmissionsWizardStep.CARBON_CAPTURE, route, {
        carbonCapture: emissionsMock.ships[1].carbonCapture,
        shipId: emissionsMock.ships[1].uniqueIdentifier,
      });
    });
  });
});
