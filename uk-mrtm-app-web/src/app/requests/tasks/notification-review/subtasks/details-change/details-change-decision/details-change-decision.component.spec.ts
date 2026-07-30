import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { ReviewService } from '@requests/tasks/notification-review/services';
import {
  DETAILS_CHANGE_SUB_TASK,
  DetailsChangeDecisionComponent,
  DetailsChangeWizardStep,
} from '@requests/tasks/notification-review/subtasks/details-change';
import {
  mockNotificationReviewRequestTask,
  mockReviewDecision,
  mockStateBuild,
} from '@requests/tasks/notification-review/testing/notification-review-data.mock';

describe('DetailsChangeDecisionComponent', () => {
  let component: DetailsChangeDecisionComponent;
  let fixture: ComponentFixture<DetailsChangeDecisionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<ReviewService> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');

  class Page extends BasePage<DetailsChangeDecisionComponent> {
    get typeRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="type"]');
    }

    get responseRequiredRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="details.followUp.followUpResponseRequired"]');
    }

    set notes(value: string) {
      this.setInputValue('#details.notes', value);
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(DetailsChangeDecisionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsChangeDecisionComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new details change decision', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockNotificationReviewRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Review the details of the change');
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(2);
      expect(page.errorSummaryListContents).toEqual(['Select a decision', 'Enter a summary']);
    });
  });

  describe('for existing details change decision', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockStateBuild(mockReviewDecision, { detailsChange: TaskItemStatus.IN_PROGRESS }));
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Review the details of the change');
      expect(page.typeRadios[0].checked).toBeTruthy();
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      page.responseRequiredRadios[1].click();
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        DETAILS_CHANGE_SUB_TASK,
        DetailsChangeWizardStep.REVIEW_DECISION,
        route,
        {
          ...mockReviewDecision,
          details: {
            ...mockReviewDecision.details,
            followUp: {
              followUpResponseRequired: false,
            },
          },
        },
      );
    });

    it(`should submit a valid form`, async () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        DETAILS_CHANGE_SUB_TASK,
        DetailsChangeWizardStep.REVIEW_DECISION,
        route,
        mockReviewDecision,
      );
    });
  });
});
