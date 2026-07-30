import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { lastValueFrom, of, throwError } from 'rxjs';

import { InvitedUserInfoDTO, VerifierUsersRegistrationService } from '@mrtm/api';

import { ActivatedRouteSnapshotStub, mockClass } from '@netz/common/testing';

import { VerifierInvitationGuard } from '@invitation/verifier-invitation/verifier-invitation.guard';
import { Mocked } from 'vitest';

describe('VerifierInvitationGuard', () => {
  let guard: VerifierInvitationGuard;
  let router: Router;
  let verifierUsersRegistrationService: Mocked<VerifierUsersRegistrationService>;

  beforeEach(() => {
    verifierUsersRegistrationService = mockClass(VerifierUsersRegistrationService);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: VerifierUsersRegistrationService, useValue: verifierUsersRegistrationService },
      ],
    });
    guard = TestBed.inject(VerifierInvitationGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should navigate to root if there is no token query param', async () => {
    await expect(lastValueFrom(guard.canActivate(new ActivatedRouteSnapshotStub()))).resolves.toEqual(
      router.parseUrl('landing'),
    );
    expect(verifierUsersRegistrationService.acceptVerifierInvitation).not.toHaveBeenCalled();
  });

  it('should navigate to invalid link for all 400 errors', async () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    verifierUsersRegistrationService.acceptVerifierInvitation.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: { code: 'testCode' }, status: 400 })),
    );

    await expect(
      lastValueFrom(guard.canActivate(new ActivatedRouteSnapshotStub(null, { token: 'email-token' }))),
    ).resolves.toBeFalsy();
    expect(navigateSpy).toHaveBeenCalledWith(['invitation/verifier/invalid-link'], {
      queryParams: { code: 'testCode' },
    });
  });

  it('should resolved the invited user', async () => {
    const invitedUser: InvitedUserInfoDTO = {
      email: 'user@pmrv.uk',
      invitationStatus: 'ALREADY_REGISTERED_SET_PASSWORD_ONLY',
    };
    verifierUsersRegistrationService.acceptVerifierInvitation = vi.fn().mockReturnValue(of(invitedUser));

    await lastValueFrom(guard.canActivate(new ActivatedRouteSnapshotStub(undefined, { token: 'token' })));

    expect(guard.resolve()).toEqual(invitedUser);
    expect(verifierUsersRegistrationService.acceptVerifierInvitation).toHaveBeenCalledWith({
      token: 'token',
    });
  });

  it('should resolved the invited user and navigate to confirmed when invitation status is already registered', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const invitedUser: InvitedUserInfoDTO = { email: 'user@pmrv.uk', invitationStatus: 'ALREADY_REGISTERED' };
    verifierUsersRegistrationService.acceptVerifierInvitation = vi.fn().mockReturnValue(of(invitedUser));

    await lastValueFrom(guard.canActivate(new ActivatedRouteSnapshotStub(undefined, { token: 'token' })));
    expect(guard.resolve()).toEqual(invitedUser);
    expect(verifierUsersRegistrationService.acceptVerifierInvitation).toHaveBeenCalledWith({
      token: 'token',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['invitation/verifier/confirmed']);
  });
});
