import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { canDeactivateCreateVerificationBodyGuard } from '@verification-bodies//create-verification-body/create-verification-body.guard';

describe('canDeactivateCreateVerificationBodyGuard', () => {
  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) =>
    TestBed.runInInjectionContext(() => canDeactivateCreateVerificationBodyGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
