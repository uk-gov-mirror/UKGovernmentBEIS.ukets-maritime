import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { firstValueFrom, Observable, throwError } from 'rxjs';

import { OperatorUserDTO, OperatorUsersService, UsersService } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ErrorCodes } from '@netz/common/error';
import { ActivatedRouteSnapshotStub, asyncData, expectBusinessErrorToBe } from '@netz/common/testing';

import { saveNotFoundOperatorError } from '@accounts/errors';
import { deleteUserAuthorityGuard } from '@accounts/guards/delete-user-authority.guard';
import { Mocked } from 'vitest';

describe('deleteUserAuthorityGuard', () => {
  let usersService: Partial<Mocked<UsersService>>;
  let operatorUsersService: Partial<Mocked<OperatorUsersService>>;
  let authStore: AuthStore;

  const operator: OperatorUserDTO = {
    email: 'test@host.com',
    firstName: 'Mary',
    lastName: 'Za',
    mobileNumber: { countryCode: '+30', number: '1234567890' },
    phoneNumber: { countryCode: '+30', number: '123456780' },
  };

  const executeGuard: CanActivateFn = (route: ActivatedRouteSnapshotStub) =>
    TestBed.runInInjectionContext(() => deleteUserAuthorityGuard(route, null));

  beforeEach(() => {
    operatorUsersService = {
      getOperatorUserById: vi.fn().mockReturnValue(asyncData<OperatorUserDTO>(operator)),
    };

    usersService = {
      getCurrentUser: vi.fn().mockReturnValue(asyncData<OperatorUserDTO>(operator)),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: OperatorUsersService, useValue: operatorUsersService },
      ],
    });

    authStore = TestBed.inject(AuthStore);
    authStore.setUserState({
      roleType: 'OPERATOR',
      userId: 'ABC1',
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  // The guard's first value comes from `toObservable` (authStore.rxSelect), which only emits once
  // its effect flushes. `TestBed.tick()` drives that flush so these tests don't depend on the
  // auto-scheduler, which can be wedged by cross-file state under the non-isolated runner.
  it('should provide other user information', async () => {
    const route = new ActivatedRouteSnapshotStub({ accountId: '1', userId: 'asdf4' });
    const result$ = executeGuard(route, null) as Observable<boolean>;
    const result = firstValueFrom(result$);
    TestBed.tick();

    await expect(result).resolves.toBeTruthy();
    expect(operatorUsersService.getOperatorUserById).toHaveBeenCalledWith(1, 'asdf4');
  });

  it('should provide current user information', async () => {
    const route = new ActivatedRouteSnapshotStub({ accountId: '1', userId: 'ABC1' });
    const result$ = executeGuard(route, null) as Observable<boolean>;
    const result = firstValueFrom(result$);
    TestBed.tick();

    await expect(result).resolves.toBeTruthy();
    expect(usersService.getCurrentUser).toHaveBeenCalled();
  });

  it('should throw an error when visiting a deleted user', async () => {
    operatorUsersService.getOperatorUserById.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { code: ErrorCodes.AUTHORITY1004 } })),
    );
    const route = new ActivatedRouteSnapshotStub({ accountId: '1', userId: 'asdf4' });
    const result$ = executeGuard(route, null) as Observable<boolean>;
    const result = firstValueFrom(result$);
    TestBed.tick();

    await expect(result).rejects.toBeTruthy();
    await expectBusinessErrorToBe(saveNotFoundOperatorError(1));
  });
});
