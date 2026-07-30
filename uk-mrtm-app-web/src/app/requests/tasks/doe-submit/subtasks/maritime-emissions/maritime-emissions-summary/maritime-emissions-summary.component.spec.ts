import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { AuthStore } from '@netz/common/auth';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import { taskProviders } from '@requests/common/task.providers';
import {
  MARITIME_EMISSIONS_SUB_TASK,
  MaritimeEmissionsWizardStep,
} from '@requests/tasks/doe-submit/subtasks/maritime-emissions';
import { MaritimeEmissionsSummaryComponent } from '@requests/tasks/doe-submit/subtasks/maritime-emissions/maritime-emissions-summary';
import { mockDoeMaritimeEmissions, mockStateBuild } from '@requests/tasks/doe-submit/testing/doe-submit-data.mock';

describe('MaritimeEmissionsSummaryComponent', () => {
  let component: MaritimeEmissionsSummaryComponent;
  let fixture: ComponentFixture<MaritimeEmissionsSummaryComponent>;
  let page: Page;
  let store: RequestTaskStore;
  let authStore: AuthStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<unknown>> = { submitSubtask: vi.fn().mockReturnValue(of({})) };
  const taskServiceSpy = vi.spyOn(taskService, 'submitSubtask');

  class Page extends BasePage<MaritimeEmissionsSummaryComponent> {
    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(MaritimeEmissionsSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaritimeEmissionsSummaryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    store.setState(
      mockStateBuild(
        { maritimeEmissions: mockDoeMaritimeEmissions },
        { maritimeEmissions: TaskItemStatus.IN_PROGRESS },
        { [mockDoeMaritimeEmissions.totalMaritimeEmissions.supportingDocuments[0]]: '100.png' },
      ),
    );
    authStore = TestBed.inject(AuthStore);
    authStore.setUserState({ roleType: 'REGULATOR' });
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Why are you determining the maritime emissions or emissions figure for surrender?',
      'Correcting a non-material misstatement',
      'Change',
      'Notice text',
      'test notice text',
      'Change',
      'Further details',
      'test further details',
      'Change',
      'Select whether you are determining maritime emissions or only the emissions figure for surrender',
      'Maritime emissions and emissions figure for surrender',
      'Change',
      'Total maritime emissions',
      '1 tCO2e',
      'Change',
      'Less Northern Ireland surrender deduction',
      '2 tCO2e',
      'Change',
      'Emissions figure for surrender',
      '12 tCO2e',
      'Change',
      'How have you calculated the emissions?',
      'test another data source',
      'Change',
      'Supporting documents',
      '100.png',
      'Change',
      'Do you need to charge the operator a fee?',
      'Yes',
      'Change',
      'Billable hours',
      '100 hours',
      'Change',
      'Hourly rate',
      '£56.23 per hour',
      'Change',
      'Payment due date',
      '31 October 2050',
      'Change',
      'Regulator comments',
      'test regulator comments',
      'Change',
      'Total operator fee',
      '£5,623.00',
      '',
    ]);
  });

  it('should submit subtask', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      MARITIME_EMISSIONS_SUB_TASK,
      MaritimeEmissionsWizardStep.SUMMARY,
      route,
    );
  });
});
