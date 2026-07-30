import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BasePage } from '@netz/common/testing';

import { ReturnToShipsListTableComponent } from '@requests/common/components/emissions/return-to-ships-list-table';

describe('ReturnToShipsListTableComponent', () => {
  let component: ReturnToShipsListTableComponent;
  let fixture: ComponentFixture<ReturnToShipsListTableComponent>;
  let page: Page;

  class Page extends BasePage<ReturnToShipsListTableComponent> {
    get hr(): HTMLHeadingElement {
      return this.query<HTMLHeadingElement>('hr');
    }

    get link(): HTMLAnchorElement {
      return this.query<HTMLAnchorElement>('a');
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnToShipsListTableComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnToShipsListTableComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements and form with 0 errors', () => {
    expect(page.errorSummary).toBeFalsy();
    expect(page.hr).toBeTruthy();
    expect(page.link.textContent.trim()).toEqual('Return to: List of ships and calculation of maritime emissions');
  });
});
