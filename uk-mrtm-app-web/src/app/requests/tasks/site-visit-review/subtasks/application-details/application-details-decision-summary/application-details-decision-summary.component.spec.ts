import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { of } from 'rxjs';
import { produce } from 'immer';

import { TaskService } from '@netz/common/forms';
import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import {
  APPLICATION_DETAILS_SUBTASK,
  ApplicationDetailsWizardSteps,
} from '@requests/common/site-visit/subtasks/application-details';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { ApplicationDetailsDecisionSummaryComponent } from '@requests/tasks/site-visit-review/subtasks/application-details/application-details-decision-summary/application-details-decision-summary.component';

describe('ApplicationDetailsDecisionSummaryComponent', () => {
  let component: ApplicationDetailsDecisionSummaryComponent;
  let fixture: ComponentFixture<ApplicationDetailsDecisionSummaryComponent>;
  let store: RequestTaskStore;
  let page: Page;

  const route = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<any>> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskServiceMock, 'submitSubtask');

  const mockState = {
    ...mockRequestTask,
    isEditable: true,
    requestTaskItem: {
      ...mockRequestTask.requestTaskItem,
      requestInfo: {
        ...mockRequestTask.requestTaskItem.requestInfo,
        requestMetadata: { year: 2025, type: 'SITE_VISIT' },
      },
      requestTask: {
        ...mockRequestTask.requestTaskItem.requestTask,
        type: 'SITE_VISIT_APPLICATION_REVIEW',
        payload: {
          payloadType: 'SITE_VISIT_APPLICATION_REVIEW_PAYLOAD',
          year: 2025,
          siteVisit: { applicationDetails: { files: [], clarification: null } },
          siteVisitAttachments: {},
          sectionsCompleted: {},
          reviewDecision: {
            type: 'ACCEPTED',
            details: { notes: null, summary: 'All good' },
          },
          reviewAttachments: {},
        },
      },
    },
  };

  class Page extends BasePage<ApplicationDetailsDecisionSummaryComponent> {
    get confirmButton(): HTMLButtonElement | null {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(ApplicationDetailsDecisionSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationDetailsDecisionSummaryComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskServiceMock },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    store.setState(mockState);
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show Confirm and complete button when editable and subtask not completed', () => {
    expect(page.confirmButton).toBeTruthy();
    expect(page.confirmButton.textContent.trim()).toBe('Confirm and complete');
  });

  it('should hide Confirm button when subtask is already completed', () => {
    store.setState(
      produce(mockState, (state) => {
        state.requestTaskItem.requestTask.payload.sectionsCompleted = {
          [APPLICATION_DETAILS_SUBTASK]: TaskItemStatus.COMPLETED,
        };
      }),
    );
    fixture.detectChanges();

    expect(page.confirmButton).toBeNull();
  });

  it('should hide Confirm button when not editable', () => {
    store.setState(produce(mockState, (state) => void (state.isEditable = false)));
    fixture.detectChanges();

    expect(page.confirmButton).toBeNull();
  });

  it('should hide Confirm button when task type is SITE_VISIT_APPLICATION_PEER_REVIEW', () => {
    store.setState(
      produce(mockState, (state) => {
        state.requestTaskItem.requestTask.type = 'SITE_VISIT_APPLICATION_PEER_REVIEW';
      }),
    );
    fixture.detectChanges();

    expect(page.confirmButton).toBeNull();
  });

  it('should call submitSubtask when Confirm button is clicked', () => {
    page.confirmButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      APPLICATION_DETAILS_SUBTASK,
      ApplicationDetailsWizardSteps.SUMMARY,
      route,
    );
  });
});
