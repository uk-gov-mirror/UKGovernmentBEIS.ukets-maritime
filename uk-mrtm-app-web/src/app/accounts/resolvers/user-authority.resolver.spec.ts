import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { firstValueFrom, Observable } from 'rxjs';

import { OperatorUserDTO, OperatorUsersService, UsersService } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ActivatedRouteSnapshotStub, asyncData } from '@netz/common/testing';

import { userAuthorityResolver } from '@accounts/resolvers/user-authority.resolver';
import { UserAuthorityDTO } from '@accounts/types/user-authority.type';
import { Mocked } from 'vitest';

describe('userAuthorityResolver', () => {
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

  const executeResolver: ResolveFn<Observable<UserAuthorityDTO>> = (route: ActivatedRouteSnapshotStub) =>
    TestBed.runInInjectionContext(() => userAuthorityResolver(route, null));

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
    expect(executeResolver).toBeTruthy();
  });

  it('should provide other user information', async () => {
    const route = new ActivatedRouteSnapshotStub({ accountId: '1', userId: 'asdf4' });
    const result$ = executeResolver(route, null) as Observable<UserAuthorityDTO>;
    const result = firstValueFrom(result$);
    // The resolver's first value comes from `toObservable` (authStore.rxSelect), which only emits
    // once its effect flushes. Drive that flush so the test doesn't depend on the auto-scheduler,
    // which can be wedged by cross-file state under the non-isolated runner.
    TestBed.tick();

    await expect(result).resolves.toEqual(operator);
    expect(operatorUsersService.getOperatorUserById).toHaveBeenCalledWith(1, 'asdf4');
  });

  it('should provide current user information', async () => {
    const route = new ActivatedRouteSnapshotStub({ accountId: '1', userId: 'ABC1' });
    const result$ = executeResolver(route, null) as Observable<UserAuthorityDTO>;
    const result = firstValueFrom(result$);
    TestBed.tick();
    await expect(result).resolves.toEqual(operator);
  });
});
