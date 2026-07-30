import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { of } from 'rxjs';
import { produce } from 'immer';

import { TaskService } from '@netz/common/forms';
import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { SiteVisitCommonTaskPayload } from '@requests/common/site-visit/site-visit-common.types';
import {
  APPLICATION_DETAILS_SUBTASK,
  ApplicationDetailsWizardSteps,
} from '@requests/common/site-visit/subtasks/application-details';
import { ApplicationDetailsSummaryComponent } from '@requests/common/site-visit/subtasks/application-details/application-details-summary';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('ApplicationDetailsSummaryComponent', () => {
  let component: ApplicationDetailsSummaryComponent;
  let fixture: ComponentFixture<ApplicationDetailsSummaryComponent>;
  let store: RequestTaskStore;
  let page: Page;

  const route = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<any>> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskServiceMock, 'submitSubtask');

  const mockPayload: SiteVisitCommonTaskPayload = {
    payloadType: 'SITE_VISIT_APPLICATION_SAVE_PAYLOAD',
    year: 2025,
    siteVisit: {
      applicationDetails: {
        files: [],
        clarification: 'Some notes',
      },
    },
    siteVisitAttachments: {},
    sectionsCompleted: {},
  };

  const mockSiteVisitState = {
    ...mockRequestTask,
    requestTaskItem: {
      ...mockRequestTask.requestTaskItem,
      requestInfo: {
        ...mockRequestTask.requestTaskItem.requestInfo,
        requestMetadata: { year: 2025, type: 'SITE_VISIT' },
      },
      requestTask: {
        ...mockRequestTask.requestTaskItem.requestTask,
        type: 'SITE_VISIT_APPLICATION_SUBMIT',
        payload: mockPayload,
      },
    },
  };

  class Page extends BasePage<ApplicationDetailsSummaryComponent> {
    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(ApplicationDetailsSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationDetailsSummaryComponent],
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
    store.setState(mockSiteVisitState);
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTML elements when not editable', () => {
    store.setState(produce(mockSiteVisitState, (state) => void (state.isEditable = false)));
    fixture.detectChanges();

    expect(page.summariesContents).toEqual([
      'Reporting year',
      '2025',
      'Supporting files',
      'Not provided',
      'Notes',
      'Some notes',
    ]);
  });

  it('should show confirm button when editable and subtask not completed', () => {
    expect(page.submitButton).toBeTruthy();
    expect(page.submitButton.textContent.trim()).toBe('Confirm and complete');
  });

  it('should hide confirm button when subtask is completed', () => {
    store.setState(
      produce(mockSiteVisitState, (state) => {
        (state.requestTaskItem.requestTask.payload as SiteVisitCommonTaskPayload).sectionsCompleted = {
          [APPLICATION_DETAILS_SUBTASK]: TaskItemStatus.COMPLETED,
        };
      }),
    );
    fixture.detectChanges();

    expect(page.submitButton).toBeNull();
  });

  it('should hide confirm button when not editable', () => {
    store.setState(produce(mockSiteVisitState, (state) => void (state.isEditable = false)));
    fixture.detectChanges();

    expect(page.submitButton).toBeNull();
  });

  it('should call submitSubtask when confirm button is clicked', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      APPLICATION_DETAILS_SUBTASK,
      ApplicationDetailsWizardSteps.SUMMARY,
      route,
    );
  });
});
