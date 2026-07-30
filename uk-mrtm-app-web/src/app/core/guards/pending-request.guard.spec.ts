import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { firstValueFrom, lastValueFrom, Observable, timer } from 'rxjs';

import { PendingRequestService } from '@netz/common/services';

import { PendingRequestGuard } from '@core/guards/pending-request.guard';
import { PendingRequest } from '@core/interfaces';
import { MockInstance } from 'vitest';

describe('PendingRequestGuard', () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let guard: PendingRequestGuard;
  let router: Router;
  let windowAlert: MockInstance;

  @Component({
    selector: 'mrtm-test-1',
    standalone: true,
    template: '',
    providers: [PendingRequestService],
  })
  class TestComponent implements PendingRequest {
    readonly pendingRequest = inject(PendingRequestService);
    someRequest = timer(3000).pipe(this.pendingRequest.trackRequest());
  }

  @Component({ selector: 'mrtm-test-2', standalone: true, template: '' })
  class EmptyTestComponent {}

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    guard = TestBed.inject(PendingRequestGuard);
    router = TestBed.inject(Router);
    windowAlert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should alert if deactivating while request is pending', async () => {
    vi.useFakeTimers();

    testComponent.someRequest.subscribe();

    await expect(lastValueFrom(guard.canDeactivate(testComponent) as Observable<boolean>)).resolves.toBeFalsy();
    expect(windowAlert).toHaveBeenCalled();

    vi.advanceTimersByTime(3000);
    vi.useRealTimers();
  });

  it('should allow deactivation if forced navigation', () => {
    vi.spyOn(router, 'currentNavigation').mockReturnValue({ extras: { state: { forceNavigation: true } } } as any);

    expect(guard.canDeactivate(testComponent)).toEqual(true);
  });

  it('should allow deactivation if request is not pending', () => {
    return expect(lastValueFrom(guard.canDeactivate(testComponent) as Observable<boolean>)).resolves.toBeTruthy();
  });

  it('should allow deactivation if there is no globally pending request', async () => {
    vi.useFakeTimers();
    const pendingRequestService = TestBed.inject(PendingRequestService);
    const canDeactivate = guard.canDeactivate(
      TestBed.createComponent(EmptyTestComponent).componentInstance,
    ) as Observable<boolean>;

    timer(3000).pipe(pendingRequestService.trackRequest()).subscribe();

    await expect(firstValueFrom(canDeactivate)).resolves.toBeFalsy();

    vi.advanceTimersByTime(3000);

    await expect(firstValueFrom(canDeactivate)).resolves.toBeTruthy();

    vi.useRealTimers();
  });

  it('should allow deactivation if there is no globally or locally pending request', async () => {
    vi.useFakeTimers();
    const pendingRequestService = TestBed.inject(PendingRequestService);
    const canDeactivate = guard.canDeactivate(testComponent) as Observable<boolean>;

    timer(2000).pipe(pendingRequestService.trackRequest()).subscribe();
    testComponent.someRequest.subscribe();

    await expect(lastValueFrom(canDeactivate)).resolves.toBeFalsy();

    vi.advanceTimersByTime(2000);

    await expect(lastValueFrom(canDeactivate)).resolves.toBeFalsy();

    vi.advanceTimersByTime(3000);

    await expect(lastValueFrom(canDeactivate)).resolves.toBeTruthy();

    vi.useRealTimers();
  });
});
