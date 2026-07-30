import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { DATA_GAPS_SUB_TASK, DataGapsWizardStep } from '@requests/common/emp/subtasks/data-gaps';
import { mockEmpDataGaps } from '@requests/common/emp/testing/emp-data.mock';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { EmpVariationRegulatorService } from '@requests/tasks/emp-variation-regulator/services';
import { DataGapsVariationRegulatorDecisionComponent } from '@requests/tasks/emp-variation-regulator/subtasks/data-gaps';
import { mockEmpVariationRegulatorStateBuild } from '@requests/tasks/emp-variation-regulator/testing/emp-variation-regulator-data.mock';
import { HTML_DIFF } from '@shared/directives';

describe('DataGapsVariationRegulatorDecisionComponent', () => {
  let component: DataGapsVariationRegulatorDecisionComponent;
  let fixture: ComponentFixture<DataGapsVariationRegulatorDecisionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpVariationRegulatorService> = {
    saveVariationRegulatorDecision: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveVariationRegulatorDecision');

  class Page extends BasePage<DataGapsVariationRegulatorDecisionComponent> {
    get dataGapsSummaryTemplate() {
      return this.query<HTMLElement>('mrtm-data-gaps-summary-template');
    }

    setVariationScheduleItem(value: string, index: number) {
      this.setInputValue(`#variationScheduleItems.${index}.item`, value);
    }

    set notes(value: string) {
      this.setInputValue(`#notes`, value);
    }

    get addItemButton() {
      return this.queryAll<HTMLButtonElement>('button[govukSecondaryButton]').find(
        (el) => el.textContent.trim() === 'Add item',
      );
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(DataGapsVariationRegulatorDecisionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGapsVariationRegulatorDecisionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
        { provide: HTML_DIFF, useValue: true },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    store.setState(
      mockEmpVariationRegulatorStateBuild({ dataGaps: mockEmpDataGaps }, { dataGaps: TaskItemStatus.IN_PROGRESS }),
    );
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.dataGapsSummaryTemplate).toBeTruthy();
  });

  it('should submit subtask', () => {
    page.addItemButton.click();
    fixture.detectChanges();
    page.submitButton.click();

    fixture.detectChanges();
    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents).toEqual([
      'You must add an item to the list of changes required.',
      'Enter the change required by the operator',
    ]);

    page.setVariationScheduleItem('test change1', 0);
    page.notes = 'test notes';
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      DATA_GAPS_SUB_TASK,
      DataGapsWizardStep.VARIATION_REGULATOR_DECISION,
      route,
      {
        notes: 'test notes',
        variationScheduleItems: [
          {
            item: 'test change1',
          },
        ],
      },
      subtaskReviewGroupMap[DATA_GAPS_SUB_TASK],
    );
  });
});
