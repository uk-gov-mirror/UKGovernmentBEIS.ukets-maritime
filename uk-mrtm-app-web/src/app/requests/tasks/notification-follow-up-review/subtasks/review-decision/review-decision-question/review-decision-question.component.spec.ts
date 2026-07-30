import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { FollowUpReviewService } from '@requests/tasks/notification-follow-up-review/services';
import {
  REVIEW_DECISION_SUB_TASK,
  ReviewDecisionQuestionComponent,
  ReviewDecisionWizardStep,
} from '@requests/tasks/notification-follow-up-review/subtasks/review-decision';
import {
  mockFollowUpReviewDecision,
  mockNotificationFollowUpReviewRequestTask,
  mockStateBuild,
} from '@requests/tasks/notification-follow-up-review/testing/notification-follow-up-review-data.mock';

describe('ReviewDecisionQuestionComponent', () => {
  let component: ReviewDecisionQuestionComponent;
  let fixture: ComponentFixture<ReviewDecisionQuestionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<FollowUpReviewService> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');

  class Page extends BasePage<ReviewDecisionQuestionComponent> {
    get typeRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="type"]');
    }

    setReason(value: string, index: number) {
      this.setInputValue(`#requiredChanges.${index}.reason`, value);
    }

    get addAnotherButton() {
      return this.queryAll<HTMLButtonElement>('button[govukSecondaryButton]').find(
        (el) => el.textContent.trim() === 'Add another required change',
      );
    }

    set notes(value: string) {
      this.setInputValue('#details.notes', value);
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(ReviewDecisionQuestionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewDecisionQuestionComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        provideHttpClient(),
        provideHttpClientTesting(),
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new review decision', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockNotificationFollowUpReviewRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Review follow-up response');
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(1);
      expect(page.errorSummaryListContents).toEqual(['Select a decision']);
    });
  });

  describe('for existing review decision', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockStateBuild(mockFollowUpReviewDecision, { reviewDecision: TaskItemStatus.AMENDS_NEEDED }));
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Review follow-up response');
      expect(page.typeRadios[1].checked).toBeTruthy();
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      page.addAnotherButton.click();
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummaryListContents).toEqual(['Enter the change required by the operator']);

      page.setReason('test reason', 2);
      fixture.detectChanges();
      page.submitButton.click();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        REVIEW_DECISION_SUB_TASK,
        ReviewDecisionWizardStep.REVIEW_DECISION_QUESTION,
        route,
        {
          type: mockFollowUpReviewDecision.type,
          notes: mockFollowUpReviewDecision.details.notes,
          dueDate: mockFollowUpReviewDecision.details.dueDate,
          requiredChanges: [
            {
              ...mockFollowUpReviewDecision.details.requiredChanges[0],
              files: [
                {
                  file: {
                    name: '1.png',
                  },
                  uuid: mockFollowUpReviewDecision.details.requiredChanges[0].files[0],
                },
                {
                  file: {
                    name: '2.png',
                  },
                  uuid: mockFollowUpReviewDecision.details.requiredChanges[0].files[1],
                },
              ],
            },
            mockFollowUpReviewDecision.details.requiredChanges[1],
            {
              reason: 'test reason',
              files: [],
            },
          ],
        },
      );
    });

    it(`should submit a valid form`, async () => {
      page.submitButton.click();
      fixture.detectChanges();
      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        REVIEW_DECISION_SUB_TASK,
        ReviewDecisionWizardStep.REVIEW_DECISION_QUESTION,
        route,
        {
          type: mockFollowUpReviewDecision.type,
          notes: mockFollowUpReviewDecision.details.notes,
          dueDate: mockFollowUpReviewDecision.details.dueDate,
          requiredChanges: [
            {
              ...mockFollowUpReviewDecision.details.requiredChanges[0],
              files: [
                {
                  file: {
                    name: '1.png',
                  },
                  uuid: mockFollowUpReviewDecision.details.requiredChanges[0].files[0],
                },
                {
                  file: {
                    name: '2.png',
                  },
                  uuid: mockFollowUpReviewDecision.details.requiredChanges[0].files[1],
                },
              ],
            },
            mockFollowUpReviewDecision.details.requiredChanges[1],
          ],
        },
      );
    });
  });
});
