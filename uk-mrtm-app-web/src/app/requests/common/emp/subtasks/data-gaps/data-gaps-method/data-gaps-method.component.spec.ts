import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import {
  DATA_GAPS_SUB_TASK,
  DataGapsMethodComponent,
  DataGapsWizardStep,
} from '@requests/common/emp/subtasks/data-gaps';
import {
  mockEmpDataGaps,
  mockEmpIssuanceSubmitRequestTask,
  mockStateBuild,
} from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('DataGapsMethodComponent', () => {
  let component: DataGapsMethodComponent;
  let fixture: ComponentFixture<DataGapsMethodComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');

  class Page extends BasePage<DataGapsMethodComponent> {
    set formulaeUsed(value: string) {
      this.setInputValue(`#formulaeUsed`, value);
    }

    set fuelConsumptionEstimationMethod(value: string) {
      this.setInputValue(`#fuelConsumptionEstimationMethod`, value);
    }

    set responsiblePersonOrPosition(value: string) {
      this.setInputValue(`#responsiblePersonOrPosition`, value);
    }

    set dataSources(value: string) {
      this.setInputValue(`#dataSources`, value);
    }

    set recordsLocation(value: string) {
      this.setInputValue(`#recordsLocation`, value);
    }

    set itSystemUsed(value: string) {
      this.setInputValue(`#itSystemUsed`, value);
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(DataGapsMethodComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGapsMethodComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new abbreviations question', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockEmpIssuanceSubmitRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Methods to be used to treat data gaps');
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(4);
      expect(page.errorSummaryListContents).toEqual([
        'Enter a description of method to estimate fuel consumption',
        'Enter the name of the person or position responsible for this method',
        'Enter the data sources',
        'Enter the location where records are kept',
      ]);
    });
  });

  describe('for existing abbreviations question', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockStateBuild({ dataGaps: mockEmpDataGaps }, { dataGaps: TaskItemStatus.IN_PROGRESS }));
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual('Methods to be used to treat data gaps');
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      page.formulaeUsed = 'edited formulaeUsed';
      page.fuelConsumptionEstimationMethod = 'edited fuelConsumptionEstimationMethod';
      page.responsiblePersonOrPosition = 'edited responsiblePersonOrPosition';
      page.dataSources = 'edited dataSources';
      page.recordsLocation = 'edited recordsLocation';
      page.itSystemUsed = 'edited itSystemUsed';
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(DATA_GAPS_SUB_TASK, DataGapsWizardStep.DATA_GAPS_METHOD, route, {
        dataSources: 'edited dataSources',
        formulaeUsed: 'edited formulaeUsed',
        fuelConsumptionEstimationMethod: 'edited fuelConsumptionEstimationMethod',
        itSystemUsed: 'edited itSystemUsed',
        recordsLocation: 'edited recordsLocation',
        responsiblePersonOrPosition: 'edited responsiblePersonOrPosition',
      });
    });

    it(`should submit a valid form`, async () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        DATA_GAPS_SUB_TASK,
        DataGapsWizardStep.DATA_GAPS_METHOD,
        route,
        mockEmpDataGaps,
      );
    });
  });
});
