import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SiteVisitApplicationSubmittedRequestActionPayload } from '@mrtm/api';

import { mockRequestAction } from '@netz/common/request-action';
import { RequestActionStore } from '@netz/common/store';
import { BasePage } from '@netz/common/testing';

import { SiteVisitSubmittedDetailsComponent } from '@requests/timeline/site-visit-submitted/site-visit-submitted-details';

describe('SiteVisitSubmittedDetailsComponent', () => {
  let component: SiteVisitSubmittedDetailsComponent;
  let fixture: ComponentFixture<SiteVisitSubmittedDetailsComponent>;
  let store: RequestActionStore;
  let page: Page;

  class Page extends BasePage<SiteVisitSubmittedDetailsComponent> {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteVisitSubmittedDetailsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(RequestActionStore);
    store.setState({
      action: {
        ...mockRequestAction.action,
        type: 'SITE_VISIT_APPLICATION_SUBMITTED',
        requestId: 'MASV00001-2025',
        payload: {
          payloadType: 'SITE_VISIT_APPLICATION_SUBMITTED_PAYLOAD',
          siteVisit: {
            applicationDetails: {
              files: [],
              clarification: 'Some notes',
            },
          },
          siteVisitAttachments: {},
          sectionsCompleted: {},
        } as SiteVisitApplicationSubmittedRequestActionPayload,
      },
    });

    fixture = TestBed.createComponent(SiteVisitSubmittedDetailsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTML elements', () => {
    expect(page.heading2.textContent.trim()).toBe('Evidence for a virtual site visit application');
    expect(page.summariesContents).toEqual([
      'Reporting year',
      '2025',
      'Supporting files',
      'Not provided',
      'Notes',
      'Some notes',
    ]);
  });
});
