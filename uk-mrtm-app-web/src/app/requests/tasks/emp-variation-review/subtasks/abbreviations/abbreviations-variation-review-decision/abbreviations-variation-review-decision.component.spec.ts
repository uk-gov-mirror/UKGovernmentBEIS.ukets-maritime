import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { ABBREVIATIONS_SUB_TASK, AbbreviationsWizardStep } from '@requests/common/emp/subtasks/abbreviations';
import { mockEmpAbbreviations, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { EmpVariationReviewService } from '@requests/tasks/emp-variation-review/services';
import { AbbreviationsVariationReviewDecisionComponent } from '@requests/tasks/emp-variation-review/subtasks/abbreviations';

describe('AbbreviationsVariationReviewDecisionComponent', () => {
  let component: AbbreviationsVariationReviewDecisionComponent;
  let fixture: ComponentFixture<AbbreviationsVariationReviewDecisionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpVariationReviewService> = {
    saveReviewDecision: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveReviewDecision');

  class Page extends BasePage<AbbreviationsVariationReviewDecisionComponent> {
    get typeRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="type"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(AbbreviationsVariationReviewDecisionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbbreviationsVariationReviewDecisionComponent],
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
      mockStateBuild({ abbreviations: mockEmpAbbreviations }, { abbreviations: TaskItemStatus.IN_PROGRESS }),
    );
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Are you using any abbreviations or terminology in your application which need explanation?',
      'Yes',
      'Change  whether any abbreviations or terminology are used in your application which need explanation',
      'Abbreviation, acronym or terminology',
      'Abbreviation1',
      'Change  abbreviation, acronym or terminology (Definition 1)',
      'Definition',
      'Definition1',
      'Change definition (Definition 1)',
      'Abbreviation, acronym or terminology',
      'Abbreviation2',
      'Change  abbreviation, acronym or terminology (Definition 2)',
      'Definition',
      'Definition2',
      'Change definition (Definition 2)',
    ]);
  });

  it('should submit subtask', () => {
    page.submitButton.click();

    fixture.detectChanges();
    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents).toEqual(['Select a decision for this review group']);

    page.typeRadios[0].click();
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      ABBREVIATIONS_SUB_TASK,
      AbbreviationsWizardStep.DECISION,
      route,
      { notes: null, type: 'ACCEPTED', variationScheduleItems: [] },
      subtaskReviewGroupMap[ABBREVIATIONS_SUB_TASK],
    );
  });
});
