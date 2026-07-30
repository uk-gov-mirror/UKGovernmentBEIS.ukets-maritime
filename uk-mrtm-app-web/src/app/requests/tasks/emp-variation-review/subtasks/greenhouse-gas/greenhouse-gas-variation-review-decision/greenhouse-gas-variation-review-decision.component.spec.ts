import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { GREENHOUSE_GAS_SUB_TASK, GreenhouseGasWizardStep } from '@requests/common/emp/subtasks/greenhouse-gas';
import { mockGreenhouseGas, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { EmpVariationReviewService } from '@requests/tasks/emp-variation-review/services';
import { GreenhouseGasVariationReviewDecisionComponent } from '@requests/tasks/emp-variation-review/subtasks/greenhouse-gas';

describe('GreenhouseGasVariationReviewDecisionComponent', () => {
  let component: GreenhouseGasVariationReviewDecisionComponent;
  let fixture: ComponentFixture<GreenhouseGasVariationReviewDecisionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpVariationReviewService> = {
    saveReviewDecision: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveReviewDecision');

  class Page extends BasePage<GreenhouseGasVariationReviewDecisionComponent> {
    get typeRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="type"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(GreenhouseGasVariationReviewDecisionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreenhouseGasVariationReviewDecisionComponent],
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
    store.setState(mockStateBuild({ greenhouseGas: mockGreenhouseGas }, { greenhouseGas: TaskItemStatus.IN_PROGRESS }));
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Procedure reference',
      'test reference',
      'Change procedure reference (Determining fuel bunkered and fuel in tanks)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Determining fuel bunkered and fuel in tanks)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Determining fuel bunkered and fuel in tanks)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Determining fuel bunkered and fuel in tanks)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Determining fuel bunkered and fuel in tanks)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Determining fuel bunkered and fuel in tanks)',
      'Procedure reference',
      'test reference',
      'Change procedure reference (Bunkering cross-checks)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Bunkering cross-checks)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Bunkering cross-checks)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Bunkering cross-checks)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Bunkering cross-checks)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Bunkering cross-checks)',
      'Procedure reference',
      'test reference',
      'Change procedure reference (Recording, retrieving, transmitting and storing information)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Recording, retrieving, transmitting and storing information)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Recording, retrieving, transmitting and storing information)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Recording, retrieving, transmitting and storing information)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Recording, retrieving, transmitting and storing information)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Recording, retrieving, transmitting and storing information)',
      'Procedure reference',
      'test reference',
      'Change procedure reference (Ensuring quality assurance of measuring equipment)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Ensuring quality assurance of measuring equipment)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Ensuring quality assurance of measuring equipment)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Ensuring quality assurance of measuring equipment)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Ensuring quality assurance of measuring equipment)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Ensuring quality assurance of measuring equipment)',
      'Procedure reference',
      'test reference',
      'Change procedure reference (Recording and safeguarding completeness of voyages)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Recording and safeguarding completeness of voyages)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Recording and safeguarding completeness of voyages)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Recording and safeguarding completeness of voyages)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Recording and safeguarding completeness of voyages)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Recording and safeguarding completeness of voyages)',
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
      GREENHOUSE_GAS_SUB_TASK,
      GreenhouseGasWizardStep.DECISION,
      route,
      { notes: null, type: 'ACCEPTED', variationScheduleItems: [] },
      subtaskReviewGroupMap[GREENHOUSE_GAS_SUB_TASK],
    );
  });
});
