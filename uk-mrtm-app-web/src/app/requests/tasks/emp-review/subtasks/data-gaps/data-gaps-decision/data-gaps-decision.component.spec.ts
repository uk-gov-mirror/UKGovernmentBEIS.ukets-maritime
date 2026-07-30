import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { DATA_GAPS_SUB_TASK, DataGapsWizardStep } from '@requests/common/emp/subtasks/data-gaps';
import { mockEmpDataGaps, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { EmpReviewService } from '@requests/tasks/emp-review/services';
import { DataGapsDecisionComponent } from '@requests/tasks/emp-review/subtasks/data-gaps';

describe('DataGapsDecisionComponent', () => {
  let component: DataGapsDecisionComponent;
  let fixture: ComponentFixture<DataGapsDecisionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpReviewService> = {
    saveReviewDecision: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveReviewDecision');

  class Page extends BasePage<DataGapsDecisionComponent> {
    get typeRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="type"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(DataGapsDecisionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGapsDecisionComponent],
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
    store.setState(mockStateBuild({ dataGaps: mockEmpDataGaps }, { dataGaps: TaskItemStatus.IN_PROGRESS }));
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Description of method to estimate fuel consumption',
      'test fuelConsumptionEstimationMethod',
      'Change description of method to estimate fuel consumption',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change name of person or position responsible for this procedure',
      'Formulae used',
      'test formulaeUsed',
      'Change formulae used',
      'Data sources',
      'test dataSources',
      'Change data sources',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept',
      'Name of IT system used',
      'test itSystemUsed',
      'Change name of IT system used',
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
      DATA_GAPS_SUB_TASK,
      DataGapsWizardStep.DECISION,
      route,
      { notes: null, type: 'ACCEPTED' },
      subtaskReviewGroupMap[DATA_GAPS_SUB_TASK],
    );
  });
});
