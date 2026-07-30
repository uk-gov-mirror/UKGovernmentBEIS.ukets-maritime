import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { LinkDirective } from '../directives';
import { BreadcrumbsComponent } from './breadcrumbs.component';

describe('BreadcrumbsComponent', () => {
  @Component({
    imports: [BreadcrumbsComponent, LinkDirective],
    standalone: true,
    template: `
      <govuk-breadcrumbs [inverse]="inverse()">
        <a govukLink="breadcrumb" href="#">Home</a>
        <a govukLink="breadcrumb" href="#">Travel abroad</a>
        <a govukLink="breadcrumb" href="#">Environment</a>
      </govuk-breadcrumbs>
    `,
  })
  class TestComponent {
    readonly inverse = signal(false);
  }

  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.debugElement.query(By.directive(BreadcrumbsComponent)).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display breadcrumbs', () => {
    const hostElement: HTMLElement = fixture.nativeElement;

    const items = hostElement.querySelectorAll<HTMLLIElement>('.govuk-breadcrumbs__list-item');
    expect(items.length).toEqual(3);
    expect(items[2].querySelector<HTMLAnchorElement>('.govuk-breadcrumbs__link').textContent).toEqual('Environment');
  });

  it('should have inverse color class', () => {
    const hostElement: HTMLElement = fixture.nativeElement;
    const breadcrumbDiv = hostElement.querySelector<HTMLElement>('.govuk-breadcrumbs');
    expect(breadcrumbDiv.classList).not.toContain('govuk-breadcrumbs--inverse');

    fixture.componentInstance.inverse.set(true);
    fixture.detectChanges();

    expect(breadcrumbDiv.classList).toContain('govuk-breadcrumbs--inverse');
  });
});
