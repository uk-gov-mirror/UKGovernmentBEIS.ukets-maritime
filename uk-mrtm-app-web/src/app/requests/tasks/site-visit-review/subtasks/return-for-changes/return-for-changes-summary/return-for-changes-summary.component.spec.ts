import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { ReturnForChangesSummaryComponent } from '@requests/tasks/site-visit-review/subtasks/return-for-changes/return-for-changes-summary/return-for-changes-summary.component';

describe('ReturnForChangesSummaryComponent', () => {
  let component: ReturnForChangesSummaryComponent;
  let fixture: ComponentFixture<ReturnForChangesSummaryComponent>;
  let store: RequestTaskStore;
  let page: Page;
  let router: Router;

  const route = new ActivatedRouteStub();
  const sendForAmendsMock = vi.fn().mockReturnValue(of({}));
  const taskServiceMock = { sendForAmends: sendForAmendsMock };

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
            type: 'OPERATOR_AMENDS_NEEDED',
            details: {
              requiredChanges: [{ reason: 'Please update the evidence', files: [] }],
              notes: null,
              summary: null,
            },
          },
          reviewAttachments: {},
        },
      },
    },
  };

  class Page extends BasePage<ReturnForChangesSummaryComponent> {
    get confirmButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }

    get heading(): string {
      return this.query<HTMLElement>('h1').textContent.trim();
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(ReturnForChangesSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnForChangesSummaryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskServiceMock },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    router = TestBed.inject(Router);
    store.setState(mockState);
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the page heading', () => {
    expect(page.heading).toBe('Return for changes');
  });

  it('should show the Confirm and send button', () => {
    expect(page.confirmButton).toBeTruthy();
    expect(page.confirmButton.textContent.trim()).toBe('Confirm and send');
  });

  it('should call sendForAmends and navigate to success page on submit', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    page.confirmButton.click();
    fixture.detectChanges();

    expect(sendForAmendsMock).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['success'], { relativeTo: route });
  });
});
