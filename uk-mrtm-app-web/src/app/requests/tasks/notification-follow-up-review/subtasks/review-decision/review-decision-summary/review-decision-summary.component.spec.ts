import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { EmpService } from '@requests/tasks/emp-submit/services';
import {
  REVIEW_DECISION_SUB_TASK,
  ReviewDecisionSummaryComponent,
  ReviewDecisionWizardStep,
} from '@requests/tasks/notification-follow-up-review/subtasks/review-decision';
import {
  mockFollowUpReviewDecision,
  mockStateBuild,
} from '@requests/tasks/notification-follow-up-review/testing/notification-follow-up-review-data.mock';

describe('ReviewDecisionSummaryComponent', () => {
  let component: ReviewDecisionSummaryComponent;
  let fixture: ComponentFixture<ReviewDecisionSummaryComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpService> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'submitSubtask');

  class Page extends BasePage<ReviewDecisionSummaryComponent> {
    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(ReviewDecisionSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewDecisionSummaryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    store.setState(mockStateBuild(mockFollowUpReviewDecision, { reviewDecision: TaskItemStatus.AMENDS_NEEDED }));
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Request from the regulator',
      'some changes here',
      'Due date',
      '1 Jan 2026',
      'Submission date',
      '1 Oct 2024',
      "Operator's response",
      'Some response',
      'Supporting documents',
      '3.png4.png',
      'Decision',
      'Operator amends needed',
      'Change',
      'Changes required from operator',
      'Some changes 1 1.png2.png Some changes 2',
      'Change',
      'New due date for the response',
      '31 Oct 2050',
      'Change',
      'Notes',
      'Some notes',
      'Change',
    ]);
  });

  it('should submit subtask', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(REVIEW_DECISION_SUB_TASK, ReviewDecisionWizardStep.SUMMARY, route);
  });
});
