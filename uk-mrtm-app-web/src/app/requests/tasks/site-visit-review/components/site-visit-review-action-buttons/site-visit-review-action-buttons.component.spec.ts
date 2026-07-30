import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { produce } from 'immer';

import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { BasePage } from '@netz/common/testing';

import { APPLICATION_DETAILS_SUBTASK } from '@requests/common/site-visit/subtasks/application-details';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { SiteVisitReviewActionButtonsComponent } from '@requests/tasks/site-visit-review/components';

describe('SiteVisitReviewActionButtonsComponent', () => {
  let component: SiteVisitReviewActionButtonsComponent;
  let fixture: ComponentFixture<SiteVisitReviewActionButtonsComponent>;
  let store: RequestTaskStore;
  let page: Page;

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
          sectionsCompleted: {
            [APPLICATION_DETAILS_SUBTASK]: TaskItemStatus.ACCEPTED,
          },
          reviewDecision: {
            type: 'ACCEPTED',
            details: { notes: null, summary: 'Accepted', requiredChanges: [] },
          },
          reviewAttachments: {},
        },
      },
    },
  };

  class Page extends BasePage<SiteVisitReviewActionButtonsComponent> {
    get actionLinks(): HTMLAnchorElement[] {
      return this.queryAll<HTMLAnchorElement>('.govuk-button-group a');
    }

    get warningText(): HTMLElement | null {
      return this.query<HTMLElement>('govuk-warning-text');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(SiteVisitReviewActionButtonsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteVisitReviewActionButtonsComponent],
      providers: [provideRouter([]), ...taskProviders],
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

  it('should show Notify operator and Send for peer review buttons when decision is ACCEPTED', () => {
    const labels = page.actionLinks.map((a) => a.textContent.trim());
    expect(labels).toContain('Notify operator of decision');
    expect(labels).toContain('Send for peer review');
  });

  it('should show Return for changes button when decision is OPERATOR_AMENDS_NEEDED', () => {
    store.setState(
      produce(mockState, (state) => {
        state.requestTaskItem.requestTask.payload.reviewDecision = {
          type: 'OPERATOR_AMENDS_NEEDED',
          details: { notes: null, requiredChanges: [] } as any,
        };
        state.requestTaskItem.requestTask.payload.sectionsCompleted = {
          [APPLICATION_DETAILS_SUBTASK]: TaskItemStatus.OPERATOR_AMENDS_NEEDED,
        };
      }),
    );
    fixture.detectChanges();

    const labels = page.actionLinks.map((a) => a.textContent.trim());
    expect(labels).toContain('Return for changes');
    expect(labels).not.toContain('Notify operator of decision');
  });

  it('should not show action buttons when not editable', () => {
    store.setState(produce(mockState, (state) => void (state.isEditable = false)));
    fixture.detectChanges();

    expect(page.actionLinks.length).toBe(0);
  });

  it('should show warning text when waiting for peer review', () => {
    store.setState(
      produce(mockState, (state) => {
        state.requestTaskItem.requestTask.type = 'SITE_VISIT_WAIT_FOR_PEER_REVIEW';
      }),
    );
    fixture.detectChanges();

    expect(page.warningText).toBeTruthy();
    expect(page.actionLinks.length).toBe(0);
  });
});
