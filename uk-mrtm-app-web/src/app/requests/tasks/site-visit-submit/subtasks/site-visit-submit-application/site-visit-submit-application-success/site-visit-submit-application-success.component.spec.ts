import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { BreadcrumbService } from '@netz/common/navigation';
import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { SiteVisitSubmitApplicationSuccessComponent } from '@requests/tasks/site-visit-submit/subtasks/site-visit-submit-application/site-visit-submit-application-success';

describe('SiteVisitSubmitApplicationSuccessComponent', () => {
  class Page extends BasePage<SiteVisitSubmitApplicationSuccessComponent> {}

  let component: SiteVisitSubmitApplicationSuccessComponent;
  let fixture: ComponentFixture<SiteVisitSubmitApplicationSuccessComponent>;
  let page: Page;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteVisitSubmitApplicationSuccessComponent],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: new ActivatedRouteStub() }],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteVisitSubmitApplicationSuccessComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTML elements', () => {
    expect(page.heading1.textContent).toEqual('Application sent to regulator');
    expect(page.query('a').textContent.trim()).toEqual('Return to: Dashboard');
  });

  it('should show the dashboard breadcrumb on init', () => {
    const breadcrumbService = TestBed.inject(BreadcrumbService);

    expect(breadcrumbService.breadcrumbItem$.value).toEqual([{ text: 'Dashboard', link: ['dashboard'] }]);
  });
});
