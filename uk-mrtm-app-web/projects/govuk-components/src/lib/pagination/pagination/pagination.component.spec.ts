import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter, RouterOutlet } from '@angular/router';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let hostComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;
  let route: ActivatedRoute;

  const getActiveLinks = () => element.querySelectorAll<HTMLAnchorElement>('li a.govuk-pagination__link');
  const getCurrentLink = () => element.querySelector<HTMLAnchorElement>('li.govuk-pagination__item--current a');
  const getPreviousButton = () => element.querySelector<HTMLAnchorElement>('.govuk-pagination__prev a');
  const getNextButton = () => element.querySelector<HTMLAnchorElement>('.govuk-pagination__next a');
  const getEllipsisItems = () => element.querySelectorAll<HTMLLIElement>('li.govuk-pagination__item--ellipses');
  const getDetails = () =>
    Array.from(element.querySelector('.govuk-body').querySelectorAll('strong')).map((text) => text.textContent);

  @Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'test-pagination',
    imports: [PaginationComponent],
    standalone: true,
    template: `
      <govuk-pagination [count]="count()" [pageSize]="pageSize()" (currentPageChange)="this.currentPage = $event" />
    `,
  })
  class TestComponent {
    readonly count = signal<number>(undefined);
    readonly pageSize = signal<number>(undefined);
    currentPage;
  }

  @Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'test-pagination-router',
    imports: [RouterOutlet],
    standalone: true,
    template: '<router-outlet />',
  })
  class RouterComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [provideRouter([{ path: '', component: TestComponent }])],
    }).compileComponents();
  });

  beforeEach(() => {
    TestBed.createComponent(RouterComponent);
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.debugElement.query(By.directive(PaginationComponent)).componentInstance;
    hostComponent = fixture.componentInstance;
    element = fixture.nativeElement;
    route = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total pages', () => {
    expect(getActiveLinks().length).toEqual(0);

    hostComponent.count.set(36);
    hostComponent.pageSize.set(10);
    fixture.detectChanges();

    expect(getActiveLinks().length).toEqual(4);
    expect(component.pageNumbers).toEqual([1, 2, 3, 4]);

    hostComponent.count.set(53);
    hostComponent.pageSize.set(10);
    fixture.detectChanges();

    expect(getActiveLinks().length).toEqual(6);
    expect(component.pageNumbers).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should emit currentPage', async () => {
    const links = getCurrentLink();
    expect(hostComponent.currentPage).toEqual(1);
    expect(links).toBeFalsy;

    hostComponent.count.set(36);
    hostComponent.pageSize.set(10);
    fixture.detectChanges();

    const page3 = getActiveLinks()[1];
    expect(page3.textContent.trim()).toEqual('2');

    page3.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(route.snapshot.queryParamMap.get('page')).toEqual('2');
    expect(hostComponent.currentPage).toEqual(2);
  });

  it('should show dots for a large amount of pages', async () => {
    hostComponent.count.set(126);
    hostComponent.pageSize.set(10);
    fixture.detectChanges();

    expect(getEllipsisItems()?.length).toEqual(1);
    expect(getActiveLinks()?.length).toEqual(3);
    expect(getNextButton()).toBeTruthy();
  });

  it('should limit page size to the current count', async () => {
    hostComponent.count.set(3);
    hostComponent.pageSize.set(10);
    fixture.detectChanges();

    expect(getDetails()).toEqual(['1', '3', '3']);

    hostComponent.count.set(15);
    hostComponent.pageSize.set(10);
    fixture.detectChanges();

    getActiveLinks()[1].click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getDetails()).toEqual(['11', '15', '15']);
  });

  it('should not show previous on first page or next on last page', async () => {
    hostComponent.count.set(30);
    hostComponent.pageSize.set(10);
    fixture.detectChanges();

    expect(getPreviousButton()).toBeFalsy();
    expect(getNextButton()).toBeTruthy();

    getActiveLinks()[0].click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getPreviousButton()).toBeFalsy();
    expect(getNextButton()).toBeTruthy();

    getActiveLinks()[2].click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getPreviousButton()).toBeTruthy();
    expect(getNextButton()).toBeFalsy();
  });

  it('should not display a page if no results exist', () => {
    hostComponent.count.set(0);
    hostComponent.pageSize.set(0);
    fixture.detectChanges();

    expect(getActiveLinks().length).toEqual(0);
  });
});
