import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { lastValueFrom, of, throwError } from 'rxjs';

import { AccountVerificationBodyService } from '@mrtm/api';

import { ActivatedRouteSnapshotStub, expectBusinessErrorToBe } from '@netz/common/testing';

import { viewNotFoundOperatorError } from '@accounts/errors';
import { ReplaceVerifierGuard } from '@accounts/guards';
import { Mocked } from 'vitest';

describe('ReplaceVerifierGuard', () => {
  let guard: ReplaceVerifierGuard;
  let accountVerificationBodyService: Partial<Mocked<AccountVerificationBodyService>>;

  const route = new ActivatedRouteSnapshotStub({ accountId: '1' });

  beforeEach(() => {
    accountVerificationBodyService = {
      getVerificationBodyOfAccount: vi.fn() as any,
    };
    TestBed.configureTestingModule({
      providers: [{ provide: AccountVerificationBodyService, useValue: accountVerificationBodyService }],
    });
    guard = TestBed.inject(ReplaceVerifierGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if a verification body is found', async () => {
    accountVerificationBodyService.getVerificationBodyOfAccount = vi
      .fn()
      .mockReturnValueOnce(of({ id: 1, name: 'testName' }));

    await expect(lastValueFrom(guard.canActivate(route))).resolves.toBeTruthy();
  });

  it('should navigate to error page if a verification body is appointed', async () => {
    accountVerificationBodyService.getVerificationBodyOfAccount.mockReturnValueOnce(
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );

    await expect(lastValueFrom(guard.canActivate(route))).rejects.toBeTruthy();

    await expectBusinessErrorToBe(viewNotFoundOperatorError(1));
  });

  it('should rethrow all other errors', async () => {
    accountVerificationBodyService.getVerificationBodyOfAccount.mockReturnValue(throwError(() => ({ status: 500 })));

    await expect(lastValueFrom(guard.canActivate(route))).rejects.toBeTruthy();
  });
});
