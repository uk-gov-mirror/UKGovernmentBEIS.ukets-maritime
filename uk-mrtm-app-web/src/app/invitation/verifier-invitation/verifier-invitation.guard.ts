import { inject, Service } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve, Router, UrlTree } from '@angular/router';

import { catchError, map, Observable, of, tap, throwError } from 'rxjs';

import { InvitedUserInfoDTO, VerifierUsersRegistrationService } from '@mrtm/api';

import { isBadRequest } from '@netz/common/error';

@Service()
export class VerifierInvitationGuard implements CanActivate, Resolve<InvitedUserInfoDTO> {
  private readonly router = inject(Router);
  private readonly verifierUsersRegistrationService = inject(VerifierUsersRegistrationService);

  private invitedUser: InvitedUserInfoDTO;

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const token = route.queryParamMap.get('token');

    return token
      ? this.verifierUsersRegistrationService.acceptVerifierInvitation({ token }).pipe(
          tap((invitedUser) => (this.invitedUser = invitedUser)),
          map(() => true),
          map(() => {
            if (this.invitedUser.invitationStatus == 'ALREADY_REGISTERED') {
              this.router.navigate(['invitation/verifier/confirmed']);
              return;
            }
            return ['PENDING_TO_REGISTERED_SET_PASSWORD_ONLY', 'ALREADY_REGISTERED_SET_PASSWORD_ONLY'].includes(
              this.invitedUser.invitationStatus,
            );
          }),
          catchError((res: unknown) => {
            if (isBadRequest(res)) {
              this.router.navigate(['invitation/verifier/invalid-link'], {
                queryParams: { code: res.error.code },
              });

              return of(false);
            } else {
              return throwError(() => res);
            }
          }),
        )
      : of(this.router.parseUrl('landing'));
  }

  resolve(): InvitedUserInfoDTO {
    return this.invitedUser;
  }
}
