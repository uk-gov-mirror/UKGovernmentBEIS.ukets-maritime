import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import {
  CONTROL_ACTIVITIES_SUB_TASK,
  ControlActivitiesWizardStep,
} from '@requests/common/emp/subtasks/control-activities';
import { ControlActivitiesSummaryComponent } from '@requests/common/emp/subtasks/control-activities/control-activities-summary';
import { controlActivitiesMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { mockEmpControlActivities, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('ControlActivitiesSummaryComponent', () => {
  let fixture: ComponentFixture<ControlActivitiesSummaryComponent>;
  let component: ControlActivitiesSummaryComponent;
  let store: RequestTaskStore;
  let page: Page;

  const activatedRouteStub = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<unknown>> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };

  const taskServiceSpy = vi.spyOn(taskServiceMock, 'submitSubtask');

  class Page extends BasePage<ControlActivitiesSummaryComponent> {
    get summaryListTerms(): string[] {
      return this.queryAll('dt').map((dt) => dt.textContent.trim());
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ControlActivitiesSummaryComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        ...taskProviders,
      ],
    });

    store = TestBed.inject(RequestTaskStore);
    store.setState(
      mockStateBuild(
        {
          controlActivities: mockEmpControlActivities,
        },
        {
          controlActivities: TaskItemStatus.IN_PROGRESS,
        },
      ),
    );
    fixture = TestBed.createComponent(ControlActivitiesSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.heading1.textContent).toEqual('Check your answers');

    expect(page.queryAll('h2').map((item) => item.textContent.trim())).toEqual([
      controlActivitiesMap.qualityAssurance.title,
      controlActivitiesMap.internalReviews.title,
      controlActivitiesMap.corrections.title,
      controlActivitiesMap.outsourcedActivities.title,
      controlActivitiesMap.documentation.title,
    ]);

    expect([...new Set(page.summaryListTerms)]).toEqual([
      'Procedure reference',
      'Procedure version',
      'Description of procedure',
      'Name of person or position responsible for this procedure',
      'Location where records are kept',
      'Name of IT system used',
      'Are any of your activities outsourced?',
    ]);
  });

  it('should submit subtask', () => {
    page.standardButton.click();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      CONTROL_ACTIVITIES_SUB_TASK,
      ControlActivitiesWizardStep.SUMMARY,
      activatedRouteStub,
    );
  });
});
