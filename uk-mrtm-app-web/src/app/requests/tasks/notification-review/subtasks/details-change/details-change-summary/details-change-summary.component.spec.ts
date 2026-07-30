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
  DETAILS_CHANGE_SUB_TASK,
  DetailsChangeSummaryComponent,
  DetailsChangeWizardStep,
} from '@requests/tasks/notification-review/subtasks/details-change';
import {
  mockReviewDecision,
  mockStateBuild,
} from '@requests/tasks/notification-review/testing/notification-review-data.mock';

describe('DetailsChangeSummaryComponent', () => {
  let component: DetailsChangeSummaryComponent;
  let fixture: ComponentFixture<DetailsChangeSummaryComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpService> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'submitSubtask');

  class Page extends BasePage<DetailsChangeSummaryComponent> {
    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(DetailsChangeSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsChangeSummaryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    store.setState(mockStateBuild(mockReviewDecision, { detailsChange: TaskItemStatus.IN_PROGRESS }));
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Describe the non-significant change',
      'description the non-significant change',
      'Justification for not submitting a variation',
      'some justification',
      'Uploaded files',
      '1.png2.png3.png',
      'Provide the start date of the non-significant change',
      '1 Apr 2020',
      'Provide the end date of the non-significant change',
      '1 Mar 2023',
      'What is your decision for the information submitted?',
      'Accepted',
      'Change',
      'Do you require a response from the operator?',
      'Yes',
      'Change',
      'Explain what the operator should cover in their response',
      'some followup request',
      'Change',
      'Date response is needed',
      '31 Oct 2050',
      'Change',
      'Provide a summary of your decision to be included in the notification letter',
      'some summary',
      'Change',
      'Notes',
      'some notes',
      'Change',
    ]);
  });

  it('should submit subtask', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(DETAILS_CHANGE_SUB_TASK, DetailsChangeWizardStep.SUMMARY, route);
  });
});
