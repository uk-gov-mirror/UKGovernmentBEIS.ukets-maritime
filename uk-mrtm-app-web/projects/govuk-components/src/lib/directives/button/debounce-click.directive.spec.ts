import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DebounceClickDirective } from './debounce-click.directive';

describe('DebounceClickDirective', () => {
  let directive: DebounceClickDirective;
  let fixture: ComponentFixture<TestComponent>;

  @Component({
    imports: [DebounceClickDirective],
    standalone: true,
    template: `
      <button #button govukDebounceClick (debounceClick)="onClick()" type="button">Simple button</button>
    `,
  })
  class TestComponent {
    readonly button = viewChild<ElementRef>('button');

    onClick(): void {}
  }

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [TestComponent],
    }).createComponent(TestComponent);

    fixture.detectChanges();
    directive = fixture.debugElement.query(By.directive(DebounceClickDirective)).injector.get(DebounceClickDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should click on single click', () => {
    vi.useFakeTimers();
    vi.spyOn(fixture.componentInstance, 'onClick');
    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('button');
    button.click();
    vi.advanceTimersByTime(500);
    expect(fixture.componentInstance.onClick).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should click once on double click', () => {
    vi.useFakeTimers();
    vi.spyOn(fixture.componentInstance, 'onClick');
    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('button');
    button.click();
    button.click();
    vi.advanceTimersByTime(500);
    expect(fixture.componentInstance.onClick).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
