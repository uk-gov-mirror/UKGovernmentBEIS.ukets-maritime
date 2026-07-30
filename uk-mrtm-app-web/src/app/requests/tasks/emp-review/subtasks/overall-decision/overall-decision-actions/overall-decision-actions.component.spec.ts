import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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
import { OverallDecisionActionsComponent } from '@requests/tasks/emp-review/subtasks/overall-decision';
import { mockEmpReviewStateBuild } from '@requests/tasks/emp-review/testing/emp-review-data.mock';

describe('OverallDecisionActionsComponent', () => {
  let component: OverallDecisionActionsComponent;
  let fixture: ComponentFixture<OverallDecisionActionsComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpReviewService> = {
    saveReviewDetermination: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveReviewDetermination');

  class Page extends BasePage<OverallDecisionActionsComponent> {
    get approveButton(): HTMLButtonElement {
      return this.queryAll<HTMLButtonElement>('button').find((element) => element.textContent.trim() === 'Approve');
    }

    get withdrawButton(): HTMLButtonElement {
      return this.queryAll<HTMLButtonElement>('button').find((element) => element.textContent.trim() === 'Withdraw');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(OverallDecisionActionsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallDecisionActionsComponent],
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
      mockEmpReviewStateBuild(
        {},
        {
          sources: TaskItemStatus.ACCEPTED,
          dataGaps: TaskItemStatus.ACCEPTED,
          emissions: TaskItemStatus.ACCEPTED,
          abbreviations: TaskItemStatus.ACCEPTED,
          greenhouseGas: TaskItemStatus.ACCEPTED,
          operatorDetails: TaskItemStatus.ACCEPTED,
          controlActivities: TaskItemStatus.ACCEPTED,
          additionalDocuments: TaskItemStatus.ACCEPTED,
          managementProcedures: TaskItemStatus.ACCEPTED,
          mandate: TaskItemStatus.ACCEPTED,
        },
      ),
    );
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.approveButton).toBeTruthy();
    expect(page.withdrawButton).toBeTruthy();
  });

  it('should submit subtask when `APPROVED` button is clicked', () => {
    page.approveButton.click();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      OVERALL_DECISION_SUB_TASK,
      OverallDecisionWizardStep.OVERALL_DECISION_ACTIONS,
      route,
      'APPROVED',
    );
  });

  it('should submit subtask when `Withdraw` button is clicked', () => {
    page.withdrawButton.click();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      OVERALL_DECISION_SUB_TASK,
      OverallDecisionWizardStep.OVERALL_DECISION_ACTIONS,
      route,
      'DEEMED_WITHDRAWN',
    );
  });
});
