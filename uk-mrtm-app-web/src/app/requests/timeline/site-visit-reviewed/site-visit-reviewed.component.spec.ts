import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SiteVisitApplicationReviewSubmittedRequestActionPayload } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { mockRequestAction } from '@netz/common/request-action';
import { RequestActionStore } from '@netz/common/store';
import { BasePage } from '@netz/common/testing';

import { SiteVisitReviewedComponent } from '@requests/timeline/site-visit-reviewed/site-visit-reviewed.component';

describe('SiteVisitReviewedComponent', () => {
  let component: SiteVisitReviewedComponent;
  let fixture: ComponentFixture<SiteVisitReviewedComponent>;
  let store: RequestActionStore;
  let authStore: AuthStore;
  let page: Page;

  const mockPayload: SiteVisitApplicationReviewSubmittedRequestActionPayload = {
    payloadType: 'SITE_VISIT_APPLICATION_REVIEW_SUBMITTED_PAYLOAD',
    siteVisit: {
      applicationDetails: {
        files: [],
        clarification: 'Some review notes',
      },
    },
    siteVisitAttachments: {},
    reviewDecision: {
      type: 'ACCEPTED',
      details: {
        notes: 'Internal reviewer notes',
        summary: 'Overall decision summary',
      } as any,
    },
    reviewAttachments: {},
  } as any;

  class Page extends BasePage<SiteVisitReviewedComponent> {
    get heading(): string {
      return this.query<HTMLElement>('h2').textContent.trim();
    }
  }

  const setup = (payload = mockPayload) => {
    store.setState({
      action: {
        ...mockRequestAction.action,
        type: 'SITE_VISIT_APPLICATION_REVIEW_SUBMITTED',
        requestId: 'MASV00001-2025',
        payload,
      },
    });

    fixture = TestBed.createComponent(SiteVisitReviewedComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteVisitReviewedComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(RequestActionStore);
    authStore = TestBed.inject(AuthStore);
    authStore.setUserState({
      ...authStore.state.userState,
      roleType: 'REGULATOR',
      userId: 'regTestId',
      status: 'ENABLED',
    });
  });

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should display the Response details heading', () => {
    setup();
    expect(page.heading).toBe('Response details');
  });

  it('should display site visit summary details', () => {
    setup();
    expect(page.summariesContents).toEqual(
      expect.arrayContaining(['Reporting year', '2025', 'Notes', 'Some review notes']),
    );
  });

  it('should display review decision summary', () => {
    setup();
    const summaries = page.summariesContents;
    expect(summaries).toEqual(expect.arrayContaining(['Overall decision', 'Overall decision summary']));
  });

  it('should not show overall decision for OPERATOR_AMENDS_NEEDED', () => {
    setup({
      ...mockPayload,
      reviewDecision: {
        type: 'OPERATOR_AMENDS_NEEDED',
        details: {
          requiredChanges: [{ reason: 'Please update', files: [] }],
          notes: null,
        } as any,
      },
    });

    const summaries = page.summariesContents;
    expect(summaries).not.toContain('Overall decision');
  });
});
