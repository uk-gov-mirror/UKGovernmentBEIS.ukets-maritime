import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import { OVERALL_DECISION_SUB_TASK, OverallDecisionWizardStep } from '@requests/common/emp/subtasks/overall-decision';
import { taskProviders } from '@requests/common/task.providers';
import { EmpReviewService } from '@requests/tasks/emp-review/services';
import { OverallDecisionReviewSummaryComponent } from '@requests/tasks/emp-review/subtasks/overall-decision';
import { mockEmpReviewStateBuild } from '@requests/tasks/emp-review/testing/emp-review-data.mock';

describe('OverallDecisionSummaryComponent', () => {
  let component: OverallDecisionReviewSummaryComponent;
  let fixture: ComponentFixture<OverallDecisionReviewSummaryComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpReviewService> = {
    saveReviewDetermination: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveReviewDetermination');

  class Page extends BasePage<OverallDecisionReviewSummaryComponent> {
    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(OverallDecisionReviewSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallDecisionReviewSummaryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    store.setState(
      mockEmpReviewStateBuild(
        {},
        { overallDecision: TaskItemStatus.IN_PROGRESS },
        {},
        {},
        {},
        { type: 'APPROVED', reason: 'test' },
      ),
    );
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual(['Decision', 'Approve', 'Change', 'Reason for decision', 'test', 'Change']);
  });

  it('should submit subtask', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(OVERALL_DECISION_SUB_TASK, OverallDecisionWizardStep.SUMMARY, route, {
      reason: 'test',
      type: 'APPROVED',
    });
  });
});
