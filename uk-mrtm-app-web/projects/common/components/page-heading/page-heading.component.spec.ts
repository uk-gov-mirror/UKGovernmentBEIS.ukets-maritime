import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PageHeadingComponent } from './page-heading.component';

describe('PageHeadingComponent', () => {
  let component: PageHeadingComponent;
  let fixture: ComponentFixture<TestComponent>;
  let hostComponent: TestComponent;
  let element: HTMLElement;

  @Component({
    imports: [PageHeadingComponent],
    standalone: true,
    template: '<netz-page-heading [caption]="caption()" [size]="size()">Test heading</netz-page-heading>',
  })
  class TestComponent {
    readonly caption = signal<string>(undefined);
    readonly size = signal<'l' | 'xl'>('l');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(PageHeadingComponent)).componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display heading', () => {
    expect(element.querySelector('h1.govuk-heading-l').textContent).toEqual('Test heading');
  });

  it('should display caption, if provided', () => {
    expect(element.querySelector('span.govuk-caption-l')).toBeFalsy();

    hostComponent.caption.set('Test caption');
    fixture.detectChanges();

    expect(element.querySelector('span.govuk-caption-l').textContent).toEqual('Test caption');
  });

  it('should display xl size', () => {
    hostComponent.size.set('xl');
    hostComponent.caption.set('Test caption');
    fixture.detectChanges();

    expect(element.querySelector('h1.govuk-heading-xl')).toBeTruthy();
    expect(element.querySelector('span.govuk-caption-xl')).toBeTruthy();
  });
});
