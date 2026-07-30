import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import {
  CONTROL_ACTIVITIES_SUB_TASK,
  ControlActivitiesWizardStep,
} from '@requests/common/emp/subtasks/control-activities';
import { mockEmpControlActivities, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { taskProviders } from '@requests/common/task.providers';
import { EmpVariationReviewService } from '@requests/tasks/emp-variation-review/services';
import { ControlActivitiesVariationReviewDecisionComponent } from '@requests/tasks/emp-variation-review/subtasks/control-activities';

describe('ControlActivitiesVariationReviewDecisionComponent', () => {
  let component: ControlActivitiesVariationReviewDecisionComponent;
  let fixture: ComponentFixture<ControlActivitiesVariationReviewDecisionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpVariationReviewService> = {
    saveReviewDecision: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveReviewDecision');

  class Page extends BasePage<ControlActivitiesVariationReviewDecisionComponent> {
    get typeRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="type"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(ControlActivitiesVariationReviewDecisionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlActivitiesVariationReviewDecisionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    store.setState(
      mockStateBuild(
        { controlActivities: mockEmpControlActivities },
        { controlActivities: TaskItemStatus.IN_PROGRESS },
      ),
    );
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Procedure reference',
      'test reference',
      'Change procedure reference (Quality assurance and reliability of information technology)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Quality assurance and reliability of information technology)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Quality assurance and reliability of information technology)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Quality assurance and reliability of information technology)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Quality assurance and reliability of information technology)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Quality assurance and reliability of information technology)',
      'Procedure reference',
      'test reference',
      'Change procedure reference (Internal reviews and validation of data)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Internal reviews and validation of data)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Internal reviews and validation of data)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Internal reviews and validation of data)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Internal reviews and validation of data)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Internal reviews and validation of data)',
      'Procedure reference',
      'test reference',
      'Change procedure reference (Corrections and corrective actions)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Corrections and corrective actions)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Corrections and corrective actions)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Corrections and corrective actions)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Corrections and corrective actions)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Corrections and corrective actions)',
      'Are any of your activities outsourced?',
      'Yes',
      'Change whether any of your activities are outsourced',
      'Procedure reference',
      'test reference',
      'Change procedure reference (Outsourced Activities)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Outsourced Activities)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Outsourced Activities)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Outsourced Activities)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Outsourced Activities)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Outsourced Activities)',
      'Procedure reference',
      'test reference',
      'Change procedure reference (Documentation)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Documentation)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Documentation)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Documentation)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Documentation)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Documentation)',
    ]);
  });

  it('should submit subtask', () => {
    page.submitButton.click();

    fixture.detectChanges();
    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents).toEqual(['Select a decision for this review group']);

    page.typeRadios[0].click();
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      CONTROL_ACTIVITIES_SUB_TASK,
      ControlActivitiesWizardStep.DECISION,
      route,
      { notes: null, type: 'ACCEPTED', variationScheduleItems: [] },
      subtaskReviewGroupMap[CONTROL_ACTIVITIES_SUB_TASK],
    );
  });
});
