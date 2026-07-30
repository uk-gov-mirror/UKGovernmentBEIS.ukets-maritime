import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { EMISSION_SOURCES_SUB_TASK, EmissionSourcesWizardStep } from '@requests/common/emp/subtasks/emission-sources';
import { mockEmpEmissionSources, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { EmpVariationReviewService } from '@requests/tasks/emp-variation-review/services';
import { EmissionSourcesVariationReviewDecisionComponent } from '@requests/tasks/emp-variation-review/subtasks/emission-sources';

describe('EmissionSourcesVariationReviewDecisionComponent', () => {
  let component: EmissionSourcesVariationReviewDecisionComponent;
  let fixture: ComponentFixture<EmissionSourcesVariationReviewDecisionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpVariationReviewService> = {
    saveReviewDecision: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveReviewDecision');

  class Page extends BasePage<EmissionSourcesVariationReviewDecisionComponent> {
    get typeRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="type"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(EmissionSourcesVariationReviewDecisionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmissionSourcesVariationReviewDecisionComponent],
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
    store.setState(mockStateBuild({ sources: mockEmpEmissionSources }, { sources: TaskItemStatus.IN_PROGRESS }));
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Procedure reference',
      'test reference',
      'Change procedure reference (Manage the completeness of the list of ships and emission sources)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Manage the completeness of the list of ships and emission sources)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Manage the completeness of the list of ships and emission sources)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Manage the completeness of the list of ships and emission sources)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Manage the completeness of the list of ships and emission sources)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Manage the completeness of the list of ships and emission sources)',
      'Are you using default values for all emissions factors?',
      'No',
      'Change whether using default values for all emissions factors',
      'Procedure reference',
      'test reference',
      'Change procedure reference (Determination of emission factors)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Determination of emission factors)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Determination of emission factors)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Determination of emission factors)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Determination of emission factors)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Determination of emission factors)',
      'Will you be making an emissions reduction claim relating to eligible fuels?',
      'Yes',
      'Change emissions reduction claim relating to eligible fuels',
      'Procedure reference',
      'test reference',
      'Change procedure reference (Emissions reduction claim)',
      'Procedure version',
      'Not provided',
      'Change procedure version (Emissions reduction claim)',
      'Description of procedure',
      'test description',
      'Change description of procedure (Emissions reduction claim)',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Change  name of person or position responsible for this procedure (Emissions reduction claim)',
      'Location where records are kept',
      'test recordsLocation',
      'Change location where records are kept (Emissions reduction claim)',
      'Name of IT system used',
      'Not provided',
      'Change name of IT system used (Emissions reduction claim)',
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
      EMISSION_SOURCES_SUB_TASK,
      EmissionSourcesWizardStep.DECISION,
      route,
      { notes: null, type: 'ACCEPTED', variationScheduleItems: [] },
      subtaskReviewGroupMap[EMISSION_SOURCES_SUB_TASK],
    );
  });
});
