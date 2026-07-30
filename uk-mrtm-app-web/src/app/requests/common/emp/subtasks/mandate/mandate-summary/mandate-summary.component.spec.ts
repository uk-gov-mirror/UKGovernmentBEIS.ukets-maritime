import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import { MANDATE_SUB_TASK, MandateWizardStep } from '@requests/common/emp/subtasks/mandate';
import { MandateSummaryComponent } from '@requests/common/emp/subtasks/mandate/mandate-summary';
import { mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';

describe('MandateSummaryComponent', () => {
  let component: MandateSummaryComponent;
  let fixture: ComponentFixture<MandateSummaryComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<unknown>> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'submitSubtask');

  class Page extends BasePage<MandateSummaryComponent> {
    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(MandateSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MandateSummaryComponent],
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
        {
          mandate: {
            exist: false,
          },
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
      'No',
      'Change  whether the responsibility for compliance with UK ETS has been delegated by a registered owner for one or more ships',
    ]);
  });

  it('should submit subtask', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(MANDATE_SUB_TASK, MandateWizardStep.SUMMARY, route);
  });
});
