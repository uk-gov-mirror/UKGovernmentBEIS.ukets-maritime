import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BasePage } from '@netz/common/testing';

import { SiteVisitSummaryTemplateComponent } from '@shared/components/summaries/site-visit/site-visit-summary-template/site-visit-summary-template.component';
import { SiteVisitApplicationDetailsDto } from '@shared/types';

describe('SiteVisitSummaryTemplateComponent', () => {
  let component: SiteVisitSummaryTemplateComponent;
  let fixture: ComponentFixture<SiteVisitSummaryTemplateComponent>;
  let page: Page;

  const model: SiteVisitApplicationDetailsDto = {
    reportingYear: 2025,
    files: [{ downloadUrl: '/files/test.pdf', fileName: 'test.pdf' }],
    clarification: 'Some notes',
  };

  class Page extends BasePage<SiteVisitSummaryTemplateComponent> {
    get summariesKeys(): string[] {
      return this.queryAll<HTMLElement>('dl dt').map((item) => item.textContent.trim());
    }

    get summariesValues(): string[] {
      return this.queryAll<HTMLElement>('dl dd:first-of-type').map((item) => item.textContent.trim());
    }

    get summariesActions(): string[] {
      return this.queryAll<HTMLElement>('dl dd:nth-of-type(2)').map((item) => item.textContent.trim());
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteVisitSummaryTemplateComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteVisitSummaryTemplateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('model', model);
    fixture.componentRef.setInput('isEditable', true);
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render summary list when model is not provided', () => {
    fixture.componentRef.setInput('model', undefined);
    fixture.detectChanges();

    expect(page.query('dl')).toBeNull();
  });

  it('should display all HTML elements', () => {
    expect(page.summariesKeys).toEqual(['Reporting year', 'Supporting files', 'Notes']);
    expect(page.summariesValues).toHaveLength(3);
    expect(page.summariesActions).toHaveLength(2);
  });

  it('should hide editing controls when not editable', () => {
    fixture.componentRef.setInput('isEditable', false);
    fixture.detectChanges();

    expect(page.summariesKeys).toEqual(['Reporting year', 'Supporting files', 'Notes']);
    expect(page.summariesValues).toHaveLength(3);
    expect(page.summariesActions).toHaveLength(0);
  });
});
