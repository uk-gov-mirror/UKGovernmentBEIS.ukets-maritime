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
import { ChargeOperatorComponent } from '@requests/tasks/doe-submit/subtasks/maritime-emissions/charge-operator';
import {
  mockDoeMaritimeEmissions,
  mockDoeSubmitSubmitRequestTask,
  mockStateBuild,
} from '@requests/tasks/doe-submit/testing/doe-submit-data.mock';

describe('ChargeOperatorComponent', () => {
  let component: ChargeOperatorComponent;
  let fixture: ComponentFixture<ChargeOperatorComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');

  class Page extends BasePage<ChargeOperatorComponent> {
    get chargeOperatorRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="chargeOperator"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(ChargeOperatorComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargeOperatorComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new determination reason', () => {
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
      expect(page.heading1.textContent).toEqual('Do you need to charge the operator a fee?');
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(1);
      expect(page.errorSummaryListContents).toEqual(['Select yes if you need to charge the operator a fee']);
    });
  });

  describe('for existing determination reason', () => {
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
      expect(page.heading1.textContent).toEqual('Do you need to charge the operator a fee?');
      expect(page.chargeOperatorRadios[0].checked).toBeTruthy();
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      page.chargeOperatorRadios[1].click();
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        MARITIME_EMISSIONS_SUB_TASK,
        MaritimeEmissionsWizardStep.CHARGE_OPERATOR,
        route,
        {
          chargeOperator: false,
        },
      );
    });
  });
});
