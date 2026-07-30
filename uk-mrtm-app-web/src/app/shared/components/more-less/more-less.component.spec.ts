import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { MoreLessComponent } from '@shared/components';

describe('MoreOrLessComponent', () => {
  let component: MoreLessComponent;
  let fixture: ComponentFixture<TestComponent>;
  let hostComponent: TestComponent;
  let element: HTMLElement;

  @Component({
    imports: [MoreLessComponent],
    standalone: true,
    template: '<mrtm-more-less-text [text]="text()" [index]="index()" widthClass="org-details-width" />',
    styles: `
      .org-details-width {
        width: 210px !important;
      }
    `,
  })
  class TestComponent {
    readonly text = signal<string>(undefined);
    readonly index = signal<number>(undefined);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(TestComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(MoreLessComponent)).componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the right text', () => {
    hostComponent.text.set('Organisation name');
    fixture.detectChanges();

    expect(element.querySelector('div').textContent.trim()).toEqual('Organisation name');
  });

  it('should implement the right id to div', () => {
    expect(element.querySelector('#more-less-text-1')).toBeNull();

    hostComponent.index.set(1);
    fixture.detectChanges();

    expect(element.querySelector('#more-less-text-1')).toBeTruthy();
  });
});
