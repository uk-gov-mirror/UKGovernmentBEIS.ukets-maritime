import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { OperatorUsersInvitationService, OperatorUsersService } from '@mrtm/api';

import { mockClass } from '@netz/common/testing';

import { createOperatorUserGuard } from '@accounts/guards/create-operator-user.guard';
import { UserAuthorityStore } from '@accounts/store';

describe('createOperatorUserGuard', () => {
  let store: UserAuthorityStore;

  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) =>
    TestBed.runInInjectionContext(() => createOperatorUserGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: OperatorUsersInvitationService, useValue: mockClass(OperatorUsersInvitationService) },
        { provide: OperatorUsersService, useValue: mockClass(OperatorUsersService) },
      ],
    });
    store = TestBed.inject(UserAuthorityStore);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should reset store and form', () => {
    const resetStoreSpy = vi.spyOn(store, 'resetCreateUserAuthority');
    executeGuard(undefined, undefined, undefined, undefined);
    expect(resetStoreSpy).toHaveBeenCalled();
  });
});
