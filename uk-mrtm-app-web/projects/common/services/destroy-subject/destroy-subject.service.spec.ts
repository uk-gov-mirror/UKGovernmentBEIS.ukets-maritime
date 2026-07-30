import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { finalize, interval, takeUntil } from 'rxjs';

import { Mock } from 'vitest';

import { DestroySubject } from './destroy-subject.service';

describe('DestroySubject', () => {
  let service: DestroySubject;
  let fixture: ComponentFixture<TestComponent>;
  let closeSpy: Mock;

  @Component({ standalone: true, template: '', providers: [DestroySubject] })
  class TestComponent {
    private readonly destroy$ = inject(DestroySubject);

    constructor() {
      interval(100)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => closeSpy()),
        )
        .subscribe();
    }
  }

  beforeEach(async () => {
    closeSpy = vi.fn();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    service = fixture.componentRef.injector.get(DestroySubject);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should close any subscriptions on destroy', () => {
    expect(closeSpy).not.toHaveBeenCalled();
    fixture.destroy();

    expect(closeSpy).toHaveBeenCalled();
  });
});
