import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasePage } from '@netz/common/testing';

import { SiteVisitReportingYearSummaryTemplateComponent } from '@shared/components/summaries/site-visit/site-visit-reporting-year-summary-template/site-visit-reporting-year-summary-template.component';

describe('SiteVisitReportingYearSummaryTemplateComponent', () => {
  let component: SiteVisitReportingYearSummaryTemplateComponent;
  let fixture: ComponentFixture<SiteVisitReportingYearSummaryTemplateComponent>;
  let page: Page;

  class Page extends BasePage<SiteVisitReportingYearSummaryTemplateComponent> {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteVisitReportingYearSummaryTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteVisitReportingYearSummaryTemplateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('reportingYear', 2025);
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTML elements', () => {
    expect(page.summariesContents).toEqual(['Reporting Year', '2025']);
  });
});
