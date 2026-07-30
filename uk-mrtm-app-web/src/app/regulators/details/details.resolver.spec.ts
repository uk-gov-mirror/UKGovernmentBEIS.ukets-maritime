import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';

import { lastValueFrom, Observable, throwError } from 'rxjs';

import { RegulatorUserDTO, RegulatorUsersService, UsersService } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ErrorCodes, HttpStatuses } from '@netz/common/error';
import { ActivatedRouteSnapshotStub, asyncData, expectBusinessErrorToBe } from '@netz/common/testing';

import { detailsResolver } from '@regulators/details/details.resolver';
import { viewNotFoundRegulatorError } from '@regulators/errors/business-error';
import { Mocked } from 'vitest';

describe('DetailsResolver', () => {
  const resolver = detailsResolver;
  let regulatorUsersService: Partial<Mocked<RegulatorUsersService>>;
  let usersService: Partial<Mocked<UsersService>>;
  let authStore: AuthStore;

  const callResolver: (route: ActivatedRouteSnapshot) => Observable<RegulatorUserDTO> = (route) =>
    TestBed.runInInjectionContext(() => resolver(route));

  const user: RegulatorUserDTO = {
    email: 'test@host.com',
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'developer',
    phoneNumber: '23456',
  };

  beforeEach(() => {
    regulatorUsersService = { getRegulatorUserByCaAndId: vi.fn().mockReturnValue(asyncData(user)) };
    usersService = { getCurrentUser: vi.fn().mockReturnValue(asyncData(user)) };

    TestBed.configureTestingModule({
      providers: [
        { provide: RegulatorUsersService, useValue: regulatorUsersService },
        { provide: UsersService, useValue: usersService },
      ],
    });

    authStore = TestBed.inject(AuthStore);
    authStore.setUserState({
      roleType: 'REGULATOR',
      status: 'ENABLED',
      userId: 'ABC1',
    });
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  // The resolver's first value comes from `toObservable` (authStore.rxSelect), which only emits
  // once its effect flushes. `TestBed.tick()` drives that flush so these tests don't depend on the
  // auto-scheduler, which can be wedged by cross-file state under the non-isolated runner.
  it('should provide the information of another user', async () => {
    const result = lastValueFrom(callResolver(new ActivatedRouteSnapshotStub({ userId: '1234567' })));
    TestBed.tick();
    await expect(result).resolves.toEqual(user);

    expect(regulatorUsersService.getRegulatorUserByCaAndId).toHaveBeenCalledWith('1234567');
  });

  it('should provide current user information', async () => {
    const result = lastValueFrom(callResolver(new ActivatedRouteSnapshotStub({ accountId: '1', userId: 'ABC1' })));
    TestBed.tick();
    await expect(result).resolves.toEqual(user);

    expect(usersService.getCurrentUser).toHaveBeenCalled();
  });

  it('should return to regulator list when visiting a deleted user', async () => {
    usersService.getCurrentUser.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: HttpStatuses.BadRequest,
            error: { code: ErrorCodes.AUTHORITY1003, message: 'User is not related to competent authority', data: [] },
          }),
      ),
    );

    const result = lastValueFrom(callResolver(new ActivatedRouteSnapshotStub({ accountId: '1', userId: 'ABC1' })));
    TestBed.tick();
    await expect(result).rejects.toBeTruthy();
    await expectBusinessErrorToBe(viewNotFoundRegulatorError);
  });
});
