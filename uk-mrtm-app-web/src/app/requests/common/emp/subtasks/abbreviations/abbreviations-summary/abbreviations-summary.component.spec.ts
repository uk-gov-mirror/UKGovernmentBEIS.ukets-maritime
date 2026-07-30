import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { ABBREVIATIONS_SUB_TASK, AbbreviationsWizardStep } from '@requests/common/emp/subtasks/abbreviations';
import { AbbreviationsSummaryComponent } from '@requests/common/emp/subtasks/abbreviations/abbreviations-summary';
import { mockEmpAbbreviations, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('AbbreviationsSummaryComponent', () => {
  let component: AbbreviationsSummaryComponent;
  let fixture: ComponentFixture<AbbreviationsSummaryComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<unknown>> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'submitSubtask');

  class Page extends BasePage<AbbreviationsSummaryComponent> {
    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(AbbreviationsSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbbreviationsSummaryComponent],
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

    expect(taskServiceSpy).toHaveBeenCalledWith(ABBREVIATIONS_SUB_TASK, AbbreviationsWizardStep.SUMMARY, route);
  });
});
