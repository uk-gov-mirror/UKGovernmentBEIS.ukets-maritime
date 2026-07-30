import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { OVERALL_DECISION_SUB_TASK, OverallDecisionWizardStep } from '@requests/common/emp/subtasks/overall-decision';
import { taskProviders } from '@requests/common/task.providers';
import { EmpReviewService } from '@requests/tasks/emp-review/services';
import { OverallDecisionQuestionComponent } from '@requests/tasks/emp-review/subtasks/overall-decision';
import { mockEmpReviewStateBuild } from '@requests/tasks/emp-review/testing/emp-review-data.mock';

describe('OverallDecisionQuestionComponent', () => {
  let component: OverallDecisionQuestionComponent;
  let fixture: ComponentFixture<OverallDecisionQuestionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpReviewService> = {
    saveReviewDetermination: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveReviewDetermination');

  class Page extends BasePage<OverallDecisionQuestionComponent> {
    setReason(value: string) {
      this.setInputValue(`#reason`, value);
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(OverallDecisionQuestionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallDecisionQuestionComponent],
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
    store.setState(mockEmpReviewStateBuild({}, {}));
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.heading1).toBeTruthy();
    expect(page.submitButton).toBeTruthy();
  });

  it('should submit subtask', () => {
    page.setReason('test');
    page.submitButton.click();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      OVERALL_DECISION_SUB_TASK,
      OverallDecisionWizardStep.OVERALL_DECISION_QUESTION,
      route,
      { reason: 'test' },
    );
  });
});
