import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { SiteVisitAmendsSubmitApplicationSuccessComponent } from '@requests/tasks/site-visit-amends/subtasks/site-visit-amends-submit-application/site-visit-amends-submit-application-success';

describe('SiteVisitAmendsSubmitApplicationSuccessComponent', () => {
  class Page extends BasePage<SiteVisitAmendsSubmitApplicationSuccessComponent> {}

  let component: SiteVisitAmendsSubmitApplicationSuccessComponent;
  let fixture: ComponentFixture<SiteVisitAmendsSubmitApplicationSuccessComponent>;
  let page: Page;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteVisitAmendsSubmitApplicationSuccessComponent],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: new ActivatedRouteStub() }],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteVisitAmendsSubmitApplicationSuccessComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTML elements', () => {
    expect(page.heading1.textContent).toEqual('Application sent back to regulator');
    expect(page.query('a').textContent.trim()).toEqual('Return to: Dashboard');
  });
});
