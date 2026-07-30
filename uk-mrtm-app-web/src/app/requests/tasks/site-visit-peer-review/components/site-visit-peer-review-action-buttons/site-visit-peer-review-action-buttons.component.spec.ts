import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { produce } from 'immer';

import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { BasePage } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { SiteVisitPeerReviewActionButtonsComponent } from '@requests/tasks/site-visit-peer-review/components';
import { SITE_VISIT_PEER_REVIEW_ROUTE_PREFIX } from '@requests/tasks/site-visit-peer-review/site-visit-peer-review.constants';

describe('SiteVisitPeerReviewActionButtonsComponent', () => {
  let component: SiteVisitPeerReviewActionButtonsComponent;
  let fixture: ComponentFixture<SiteVisitPeerReviewActionButtonsComponent>;
  let store: RequestTaskStore;
  let page: Page;

  const mockState = {
    ...mockRequestTask,
    isEditable: true,
    requestTaskItem: {
      ...mockRequestTask.requestTaskItem,
      requestTask: {
        ...mockRequestTask.requestTaskItem.requestTask,
        type: 'SITE_VISIT_APPLICATION_PEER_REVIEW',
        payload: {
          payloadType: 'SITE_VISIT_APPLICATION_REVIEW_PAYLOAD',
          year: 2025,
          siteVisit: { applicationDetails: { files: [], clarification: null } },
          siteVisitAttachments: {},
          sectionsCompleted: {},
          reviewDecision: null,
          reviewAttachments: {},
        },
      },
    },
  };

  class Page extends BasePage<SiteVisitPeerReviewActionButtonsComponent> {
    get actionButtons(): HTMLAnchorElement[] {
      return this.queryAll<HTMLAnchorElement>('.govuk-button-group a');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(SiteVisitPeerReviewActionButtonsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteVisitPeerReviewActionButtonsComponent],
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

  it('should display the peer review decision button when editable', () => {
    expect(page.actionButtons.length).toBe(1);
    expect(page.actionButtons[0].textContent.trim()).toBe('Peer review decision');
  });

  it('should link to the peer review decision route', () => {
    const href = page.actionButtons[0].getAttribute('href');
    expect(href).toContain(SITE_VISIT_PEER_REVIEW_ROUTE_PREFIX);
    expect(href).toContain('peer-review-decision');
  });

  it('should not display action buttons when not editable', () => {
    store.setState(produce(mockState, (state) => void (state.isEditable = false)));
    fixture.detectChanges();

    expect(page.actionButtons.length).toBe(0);
  });
});
