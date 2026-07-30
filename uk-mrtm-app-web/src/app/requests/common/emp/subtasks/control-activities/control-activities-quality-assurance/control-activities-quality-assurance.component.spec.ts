import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import {
  CONTROL_ACTIVITIES_SUB_TASK,
  ControlActivitiesWizardStep,
} from '@requests/common/emp/subtasks/control-activities';
import { ControlActivitiesQualityAssuranceComponent } from '@requests/common/emp/subtasks/control-activities/control-activities-quality-assurance/control-activities-quality-assurance.component';
import {
  mockEmpControlActivities,
  mockEmpIssuanceSubmitRequestTask,
  mockEmpProcedureForm,
  mockStateBuild,
} from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('ControlActivitiesQualityAssuranceComponent', () => {
  let fixture: ComponentFixture<ControlActivitiesQualityAssuranceComponent>;
  let component: ControlActivitiesQualityAssuranceComponent;
  let page: Page;
  let store: RequestTaskStore;

  class Page extends BasePage<ControlActivitiesQualityAssuranceComponent> {
    get textboxes() {
      return this.queryAll<HTMLInputElement>('input[type="text"], textarea');
    }

    get errorSummaryLinks() {
      return Array.from(this.errorSummary.querySelectorAll('a'));
    }
  }

  const activatedRouteStub = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<EmpTaskPayload>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };

  const taskServiceSpy = vi.spyOn(taskServiceMock, 'saveSubtask');

  const createComponent = () => {
    fixture = TestBed.createComponent(ControlActivitiesQualityAssuranceComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ControlActivitiesQualityAssuranceComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        ...taskProviders,
      ],
    });
  });

  describe('for new emission source', () => {
    beforeEach(async () => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockEmpIssuanceSubmitRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.heading1.textContent).toEqual('Quality assurance and reliability of information technology');
      expect(page.submitButton).toBeTruthy();
      expect(page.errorSummary).toBeFalsy();
      expect(page.textboxes).toHaveLength(6);
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryLinks).toHaveLength(4);
      expect(page.errorSummaryLinks.map((anchor) => anchor.textContent.trim())).toEqual([
        'Enter a procedure reference',
        'Enter a description for the procedure',
        'Enter the name of the person or position responsible for this procedure',
        'Enter the location where records are kept',
      ]);
    });
  });

  describe('for existing emission source', () => {
    beforeEach(async () => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(
        mockStateBuild(
          {
            controlActivities: mockEmpControlActivities,
          },
          { controlActivities: TaskItemStatus.IN_PROGRESS },
        ),
      );
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.heading1.textContent).toEqual('Quality assurance and reliability of information technology');
      expect(page.submitButton).toBeTruthy();
      expect(page.errorSummary).toBeFalsy();
      expect(page.textboxes).toHaveLength(6);
    });

    it('should edit and submit a valid form', async () => {
      page.setInputValue('input[name="version"]', 'test new value');

      page.submitButton.click();
      fixture.detectChanges();

      expect(taskServiceSpy).toHaveBeenCalledWith(
        CONTROL_ACTIVITIES_SUB_TASK,
        ControlActivitiesWizardStep.QUALITY_ASSURANCE,
        activatedRouteStub,
        {
          ...mockEmpProcedureForm,
          version: 'test new value',
        },
      );
    });

    it('should submit a valid form', async () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        CONTROL_ACTIVITIES_SUB_TASK,
        ControlActivitiesWizardStep.QUALITY_ASSURANCE,
        activatedRouteStub,
        mockEmpProcedureForm,
      );
    });
  });
});
