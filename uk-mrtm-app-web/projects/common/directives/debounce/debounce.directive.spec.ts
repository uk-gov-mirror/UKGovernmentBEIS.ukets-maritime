import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink } from '@angular/router';

import type { Mock } from 'vitest';

import { DebounceDirective } from './debounce.directive';

describe('DebounceDirective', () => {
  @Component({
    imports: [DebounceDirective, RouterLink],
    standalone: true,
    template: `
      <a id="first" routerLink="/first" netzDebounce>First</a>
      <a id="second" routerLink="/second" netzDebounce>Second</a>
    `,
  })
  class TestComponent {}

  let fixture: ComponentFixture<TestComponent>;
  let navigateByUrl: Mock<Router['navigateByUrl']>;

  const link = (id: string): HTMLAnchorElement =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(`#${id}`);

  const click = (id: string): void => {
    link(id).click();
    fixture.detectChanges();
  };

  const isBlocked = (id: string): boolean =>
    link(id).style.pointerEvents === 'none' &&
    link(id).hasAttribute('inert') &&
    link(id).getAttribute('aria-disabled') === 'true';

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();

    navigateByUrl = vi.fn<Router['navigateByUrl']>(async () => true);
    TestBed.inject(Router).navigateByUrl = navigateByUrl;

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not block anything before a click', () => {
    expect(isBlocked('first')).toBeFalsy();
    expect(isBlocked('second')).toBeFalsy();
  });

  it('should let the first activation through', () => {
    click('first');

    expect(navigateByUrl).toHaveBeenCalledTimes(1);
  });

  it('should block further activation of the clicked element', () => {
    click('first');

    expect(isBlocked('first')).toBeTruthy();
  });

  it('should swallow a repeat click within the debounce time', () => {
    click('first');
    vi.advanceTimersByTime(DebounceDirective.DEBOUNCE_DURATION_MS - 1);
    click('first');

    expect(navigateByUrl).toHaveBeenCalledTimes(1);
  });

  it('should leave other elements untouched', () => {
    click('first');

    expect(isBlocked('second')).toBeFalsy();

    click('second');

    expect(navigateByUrl).toHaveBeenCalledTimes(2);
  });

  it('should stay blocked until the debounce time elapses', () => {
    click('first');
    vi.advanceTimersByTime(DebounceDirective.DEBOUNCE_DURATION_MS - 1);
    fixture.detectChanges();

    expect(isBlocked('first')).toBeTruthy();
  });

  it('should release the element once the debounce time elapses', () => {
    click('first');
    vi.advanceTimersByTime(DebounceDirective.DEBOUNCE_DURATION_MS);
    fixture.detectChanges();

    expect(isBlocked('first')).toBeFalsy();

    click('first');

    expect(navigateByUrl).toHaveBeenCalledTimes(2);
  });

  it('should not extend the debounce time on a swallowed click', () => {
    click('first');
    vi.advanceTimersByTime(DebounceDirective.DEBOUNCE_DURATION_MS - 1);
    click('first');
    vi.advanceTimersByTime(1);
    click('first');

    expect(navigateByUrl).toHaveBeenCalledTimes(2);
  });
});
