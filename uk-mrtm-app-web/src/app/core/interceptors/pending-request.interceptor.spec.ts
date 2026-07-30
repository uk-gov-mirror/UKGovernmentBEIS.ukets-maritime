import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { of, Subject } from 'rxjs';

import { PendingRequestService } from '@netz/common/services';

import { pendingRequestInterceptor } from '@core/interceptors/pending-request.interceptor';

describe('PendingRequestInterceptor', () => {
  let pendingRequestService: PendingRequestService;

  beforeEach(async () => {
    pendingRequestService = TestBed.inject(PendingRequestService);
  });

  function intercept(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    return TestBed.runInInjectionContext(() => pendingRequestInterceptor(req, next));
  }

  it('should track non-GET pending requests', () => {
    const subject = new Subject<HttpResponse<unknown>>();
    const next = vi.fn().mockReturnValue(subject.asObservable());
    intercept(new HttpRequest<unknown>('POST', 'http://localhost', {}), next).subscribe();

    // While the request is in progress, it should be pending
    expect(pendingRequestService.hasPendingRequests()).toBeTruthy();

    // Complete the request
    subject.next(new HttpResponse<unknown>());
    subject.complete();

    // Now the pending request should be cleared
    expect(pendingRequestService.hasPendingRequests()).toBeFalsy();
    expect(next).toHaveBeenCalled();
  });

  it('should not track GET requests', () => {
    const next = vi.fn().mockReturnValue(of(new HttpResponse<unknown>()));
    intercept(new HttpRequest<unknown>('GET', 'http://localhost'), next).subscribe();
    expect(pendingRequestService.hasPendingRequests()).toBeFalsy();
    expect(next).toHaveBeenCalled();
  });
});
