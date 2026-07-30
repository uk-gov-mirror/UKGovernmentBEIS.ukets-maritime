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
import { ControlActivitiesOutsourcedActivitiesComponent } from '@requests/common/emp/subtasks/control-activities/control-activities-outsourced-activities/control-activities-outsourced-activities.component';
import {
  mockEmpControlActivities,
  mockEmpIssuanceSubmitRequestTask,
  mockStateBuild,
} from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('ControlActivitiesOutsourcedActivitiesComponent', () => {
  let fixture: ComponentFixture<ControlActivitiesOutsourcedActivitiesComponent>;
  let component: ControlActivitiesOutsourcedActivitiesComponent;
  let page: Page;
  let store: RequestTaskStore;

  class Page extends BasePage<ControlActivitiesOutsourcedActivitiesComponent> {
    get radios() {
      return this.queryAll<HTMLInputElement>('input[type="radio"]');
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
    fixture = TestBed.createComponent(ControlActivitiesOutsourcedActivitiesComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlActivitiesOutsourcedActivitiesComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        ...taskProviders,
      ],
    }).compileComponents();
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
      expect(page.heading1.textContent).toEqual('Outsourced Activities');
      expect(page.submitButton).toBeTruthy();
      expect(page.errorSummary).toBeFalsy();
      expect(page.radios).toHaveLength(2);
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryLinks).toHaveLength(1);
      expect(page.errorSummaryLinks.map((anchor) => anchor.textContent.trim())).toEqual([
        'Select ‘Yes’, if you want to define outsourced activities',
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
          { sources: TaskItemStatus.IN_PROGRESS },
        ),
      );
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.heading1.textContent).toEqual('Outsourced Activities');
      expect(page.submitButton).toBeTruthy();
      expect(page.errorSummary).toBeFalsy();
      expect(page.radios).toHaveLength(2);
    });

    it('should edit and submit a valid form without `factors` section', async () => {
      page.radios[1].click();
      fixture.detectChanges();

      page.submitButton.click();
      fixture.detectChanges();

      expect(taskServiceSpy).toHaveBeenCalledWith(
        CONTROL_ACTIVITIES_SUB_TASK,
        ControlActivitiesWizardStep.OUTSOURCED_ACTIVITIES,
        activatedRouteStub,
        {
          exist: false,
        },
      );
    });

    it('should submit a valid form', async () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        CONTROL_ACTIVITIES_SUB_TASK,
        ControlActivitiesWizardStep.OUTSOURCED_ACTIVITIES,
        activatedRouteStub,
        mockEmpControlActivities.outsourcedActivities,
      );
    });
  });
});
