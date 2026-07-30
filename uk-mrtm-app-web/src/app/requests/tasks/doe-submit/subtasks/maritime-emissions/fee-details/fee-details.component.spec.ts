import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import { taskProviders } from '@requests/common/task.providers';
import {
  MARITIME_EMISSIONS_SUB_TASK,
  MaritimeEmissionsWizardStep,
} from '@requests/tasks/doe-submit/subtasks/maritime-emissions';
import { FeeDetailsComponent } from '@requests/tasks/doe-submit/subtasks/maritime-emissions/fee-details';
import {
  mockDoeMaritimeEmissions,
  mockDoeSubmitSubmitRequestTask,
  mockStateBuild,
} from '@requests/tasks/doe-submit/testing/doe-submit-data.mock';

describe('FeeDetailsComponent', () => {
  let component: FeeDetailsComponent;
  let fixture: ComponentFixture<FeeDetailsComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');

  class Page extends BasePage<FeeDetailsComponent> {
    set totalBillableHours(value: number) {
      this.setInputValue(`#totalBillableHours`, value);
    }

    set hourlyRate(value: number) {
      this.setInputValue(`#hourlyRate`, value);
    }

    set comments(value: string) {
      this.setInputValue('textarea[name$="comments"]', value);
    }

    get totalOperatorFeesText(): string {
      return this.query('.govuk-body.govuk-\\!-font-weight-bold').textContent.trim();
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(FeeDetailsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeDetailsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new fee details', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockDoeSubmitSubmitRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Calculate the operator’s fee');
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(3);
      expect(page.errorSummaryListContents).toEqual([
        'Enter the total billable hours',
        'Enter the hourly rate',
        'Enter a date',
      ]);
    });
  });

  describe('for existing fee details', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(
        mockStateBuild(
          { maritimeEmissions: mockDoeMaritimeEmissions },
          { maritimeEmissions: TaskItemStatus.IN_PROGRESS },
        ),
      );
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Calculate the operator’s fee');
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      page.totalBillableHours = 5;
      page.hourlyRate = 10;
      page.comments = 'test regulator comments edited';
      fixture.detectChanges();

      expect(page.totalOperatorFeesText).toEqual('Total operator fee  £50.00');

      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        MARITIME_EMISSIONS_SUB_TASK,
        MaritimeEmissionsWizardStep.FEE_DETAILS,
        route,
        {
          comments: 'test regulator comments edited',
          dueDate: new Date('2050-10-31'),
          hourlyRate: 10,
          totalBillableHours: 5,
        },
      );
    });
  });
});
