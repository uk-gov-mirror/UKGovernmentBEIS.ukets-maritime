import { TestBed } from '@angular/core/testing';

import { lastValueFrom, of, throwError } from 'rxjs';

import { AccountVerificationBodyService } from '@mrtm/api';

import { ActivatedRouteSnapshotStub, expectBusinessErrorToBe } from '@netz/common/testing';

import { appointedVerificationBodyError } from '@accounts/errors';
import { AppointVerifierGuard } from '@accounts/guards';
import { Mocked } from 'vitest';

describe('AppointVerifierGuard', () => {
  let guard: AppointVerifierGuard;
  let accountVerificationBodyService: Partial<Mocked<AccountVerificationBodyService>>;

  const route = new ActivatedRouteSnapshotStub({ accountId: '1' });

  beforeEach(() => {
    accountVerificationBodyService = {
      getVerificationBodyOfAccount: vi.fn() as any,
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AccountVerificationBodyService, useValue: accountVerificationBodyService }],
    });

    guard = TestBed.inject(AppointVerifierGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if a verification body is not found', async () => {
    accountVerificationBodyService.getVerificationBodyOfAccount.mockReturnValue(of(null));

    await expect(lastValueFrom(guard.canActivate(route))).resolves.toBeTruthy();
  });

  it('should navigate to error page if a verification body is appointed', async () => {
    accountVerificationBodyService.getVerificationBodyOfAccount.mockReturnValue(of({ id: 1, name: 'Verifier' }) as any);

    await expect(lastValueFrom(guard.canActivate(route))).rejects.toBeTruthy();

    await expectBusinessErrorToBe(appointedVerificationBodyError(1));
  });

  it('should rethrow all other errors', async () => {
    accountVerificationBodyService.getVerificationBodyOfAccount.mockReturnValue(throwError(() => ({ status: 500 })));

    await expect(lastValueFrom(guard.canActivate(route))).rejects.toBeTruthy();
  });
});
