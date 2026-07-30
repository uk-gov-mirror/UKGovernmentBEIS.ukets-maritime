import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { RequestActionReportService } from '@netz/common/services';
import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { RelatedPrintableItemsComponent } from './related-printable-items.component';

describe('RelatedPrintableItemsComponent', () => {
  let component: RelatedPrintableItemsComponent;
  let fixture: ComponentFixture<RelatedPrintableItemsComponent>;
  let page: Page;

  class Page extends BasePage<RelatedPrintableItemsComponent> {
    get links() {
      return this.queryAll<HTMLLinkElement>('li > a');
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RequestActionReportService, { provide: ActivatedRoute, useValue: new ActivatedRouteStub() }],
    });

    fixture = TestBed.createComponent(RelatedPrintableItemsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the links', async () => {
    expect(page.links.map((el) => [el.href, el.textContent])).toEqual([
      ['http://localhost:3000/', 'Download PDF of workflow'],
    ]);
  });
});
