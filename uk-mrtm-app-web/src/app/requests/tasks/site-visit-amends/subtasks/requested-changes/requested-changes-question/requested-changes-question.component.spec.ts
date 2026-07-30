import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { RequestedChangesQuestionComponent } from '@requests/tasks/site-visit-amends/subtasks/requested-changes/requested-changes-question/requested-changes-question.component';

describe('RequestedChangesQuestionComponent', () => {
  let component: RequestedChangesQuestionComponent;
  let fixture: ComponentFixture<RequestedChangesQuestionComponent>;
  let store: RequestTaskStore;
  let page: Page;

  const route = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };

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
        type: 'SITE_VISIT_APPLICATION_AMEND',
        payload: {
          payloadType: 'SITE_VISIT_APPLICATION_AMEND_PAYLOAD',
          year: 2025,
          siteVisit: { applicationDetails: { files: [], clarification: null } },
          siteVisitAttachments: {},
          sectionsCompleted: {},
          reviewDecision: {
            type: 'OPERATOR_AMENDS_NEEDED',
            details: {
              requiredChanges: [{ reason: 'Please update the evidence', files: [] }],
              notes: 'Review notes',
            },
          },
          reviewAttachments: {},
        },
      },
    },
  };

  class Page extends BasePage<RequestedChangesQuestionComponent> {
    get checkboxes(): HTMLInputElement[] {
      return this.queryAll<HTMLInputElement>('input[type="checkbox"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(RequestedChangesQuestionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestedChangesQuestionComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: route },
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

  it('should display the header title', () => {
    expect(page.heading1.textContent.trim()).toBeTruthy();
  });

  it('should show validation error when submitting without checking the box', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents).toEqual([
      'Check the box to confirm you have made changes and want to mark as complete',
    ]);
  });

  it('should call saveSubtask when checkbox is checked and form is submitted', () => {
    page.checkboxes[0].click();
    fixture.detectChanges();
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceMock.saveSubtask).toHaveBeenCalled();
  });
});
