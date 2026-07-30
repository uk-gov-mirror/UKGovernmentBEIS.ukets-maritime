import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { BasePage, MockType } from '@netz/common/testing';

import { MANDATE_SUB_TASK, MandateWizardStep } from '@requests/common/emp/subtasks/mandate';
import { emissionsMock } from '@requests/common/emp/testing/emissions.mock';
import { mockEmpMandate, mockEmpOperatorDetails, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { EmpVariationReviewService } from '@requests/tasks/emp-variation-review/services';
import { MandateVariationReviewDecisionComponent } from '@requests/tasks/emp-variation-review/subtasks/mandate';

describe('MandateVariationReviewDecisionComponent', () => {
  let component: MandateVariationReviewDecisionComponent;

  let fixture: ComponentFixture<MandateVariationReviewDecisionComponent>;
  let page: Page;
  let store: RequestTaskStore;
  let route: ActivatedRoute;

  const taskService: MockType<EmpVariationReviewService> = {
    saveReviewDecision: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveReviewDecision');

  class Page extends BasePage<MandateVariationReviewDecisionComponent> {
    get typeRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="type"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(MandateVariationReviewDecisionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MandateVariationReviewDecisionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    route = TestBed.inject(ActivatedRoute);
    store.setState(
      mockStateBuild(
        {
          operatorDetails: mockEmpOperatorDetails,
          emissions: emissionsMock,
          mandate: mockEmpMandate,
        },
        { mandate: TaskItemStatus.IN_PROGRESS },
      ),
    );
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Has the responsibility for compliance with UK ETS been delegated to you by a registered owner for one or more ships?',
      'Yes',
      'Change  whether the responsibility for compliance with UK ETS has been delegated by a registered owner for one or more ships',
      'Declaration of delegation of UK ETS responsibility',
      'I certify that I am authorised by Test Maritime Operator Ltd to make this declaration on its behalf and believe that the information provided is true.',
      'Change declaration of delegation of UK ETS responsibility',
    ]);
    expect(page.tableContents).toEqual([
      'Registered owner name and IMO number',
      'Contact details',
      'Associated ships',
      'Date of written agreement',
      'RegisteredOwner11111111',
      'RegisteredOwner1RegisteredOwner1@o.com',
      'EVER GREEN(IMO: 1111111)',
      '1 Mar 2025',
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
      MANDATE_SUB_TASK,
      MandateWizardStep.DECISION,
      route,
      { notes: null, type: 'ACCEPTED', variationScheduleItems: [] },
      subtaskReviewGroupMap[MANDATE_SUB_TASK],
    );
  });
});
