import { inject, Service } from '@angular/core';

import { combineLatest, iif, map, Observable, switchMap, tap } from 'rxjs';

import {
  UsersService,
  VerifierAuthoritiesService,
  VerifierAuthorityUpdateDTO,
  VerifierUserDTO,
  VerifierUserInvitationDTO,
  VerifierUsersInvitationService,
  VerifierUsersService,
} from '@mrtm/api';

import { AuthStore, selectUserId, selectUserRoleType } from '@netz/common/auth';
import { BusinessErrorService, catchBadRequest, ErrorCodes } from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';

import { Store } from '@core/store';
import { SubmissionError } from '@shared/types';
import { isNil } from '@shared/utils';
import { selectIsEditableVerifierUsersList } from '@verifiers/+state/verifier-user.selectors';
import {
  initialCreateUserAuthorityState,
  userAuthorityInitialState,
  VerifierUserState,
} from '@verifiers/+state/verifier-user.state';
import { saveNotFoundVerifierError, viewNotFoundVerifierError } from '@verifiers/errors/business-error';

@Service()
export class VerifierUserStore extends Store<VerifierUserState> {
  private readonly verifierUsersInvitationService: VerifierUsersInvitationService =
    inject(VerifierUsersInvitationService);
  private readonly verifierUsersService: VerifierUsersService = inject(VerifierUsersService);
  private readonly pendingRequestService: PendingRequestService = inject(PendingRequestService);
  private readonly verifierAuthoritiesService: VerifierAuthoritiesService = inject(VerifierAuthoritiesService);
  private readonly authStore = inject(AuthStore);
  private readonly usersService = inject(UsersService);
  private readonly businessErrorService = inject(BusinessErrorService);

  constructor() {
    super(userAuthorityInitialState);
  }

  setIsInitiallySubmitted(isInitiallySubmitted: boolean): void {
    const state = this.getState();
    this.setState({
      ...state,
      createVerifierUser: {
        ...state.createVerifierUser,
        isInitiallySubmitted,
      },
    });
  }

  setIsSubmitted(isSubmitted: boolean) {
    const state = this.getState();
    this.setState({
      ...state,
      createVerifierUser: {
        ...state.createVerifierUser,
        isSubmitted,
      },
    });
  }

  setNewUserAuthority(newUserAuthority: VerifierUserInvitationDTO): void {
    const state = this.getState();
    this.setState({
      ...state,
      createVerifierUser: {
        ...state.createVerifierUser,
        newUserAuthority: newUserAuthority,
        isInitiallySubmitted: true,
      },
    });
  }

  createUserAuthority(verificationBodyId?: number, roleCode?: string) {
    const userAuthority = this.getState().createVerifierUser.newUserAuthority;
    return (
      isNil(verificationBodyId)
        ? this.verifierUsersInvitationService.inviteVerifierUser({
            ...userAuthority,
            roleCode,
          })
        : this.verifierUsersInvitationService.inviteVerifierAdminUserByVerificationBodyId(
            verificationBodyId,
            userAuthority,
          )
    ).pipe(
      this.pendingRequestService.trackRequest(),
      tap(() => {
        this.setIsSubmitted(true);
      }),
    );
  }

  editUserAuthority(userId: string, userAuthorityDTO: VerifierUserDTO, isCurrentUser = false) {
    return iif(
      () => isCurrentUser,
      this.verifierUsersService.updateCurrentVerifierUser(userAuthorityDTO),
      this.verifierUsersService.updateVerifierUserById(userId, userAuthorityDTO, 'response'),
    ).pipe(tap(() => this.setCurrentUserAuthority(userAuthorityDTO)));
  }

  setCurrentUserAuthority(currentUserAuthority: VerifierUserDTO): void {
    const state = this.getState();

    this.setState({
      ...state,
      currentVerifierUser: {
        ...state.currentVerifierUser,
        ...currentUserAuthority,
      },
    });
  }

  setSubmissionErrors(errors: SubmissionError[]) {
    const state = this.getState();
    this.setState({
      ...state,
      createVerifierUser: {
        ...state.createVerifierUser,
        submissionErrors: errors,
      },
    });
  }

  resetCreateUserAuthority(): void {
    const state = this.getState();
    this.setState({
      ...state,
      createVerifierUser: initialCreateUserAuthorityState,
    });
  }

  loadVerifierUsers(): Observable<boolean> {
    return this.verifierAuthoritiesService.getVerifierAuthorities().pipe(
      map(({ authorities, editable }) => {
        this.setState({
          ...this.getState(),
          verifierUsersList: {
            items: authorities,
            editable,
          },
        });
        return true;
      }),
    );
  }

  loadVerifierUserById(userId: string): Observable<boolean> {
    return combineLatest([
      this.authStore.rxSelect(selectUserRoleType),
      this.authStore.rxSelect(selectUserId),
      this.pipe(selectIsEditableVerifierUsersList),
    ]).pipe(
      switchMap(([roleType, currentUserId, isAdmin]) => {
        if (roleType === 'VERIFIER' && !isAdmin && userId === currentUserId) {
          return this.usersService.getCurrentUser();
        } else {
          return this.verifierUsersService.getVerifierUserById(userId).pipe(
            catchBadRequest(ErrorCodes.NOTFOUND1001, () =>
              this.businessErrorService.showError(saveNotFoundVerifierError),
            ),
            catchBadRequest([ErrorCodes.AUTHORITY1013, ErrorCodes.AUTHORITY1006], () =>
              this.businessErrorService.showError(viewNotFoundVerifierError),
            ),
          );
        }
      }),
      map((verifier: VerifierUserDTO) => {
        this.setState({
          ...this.getState(),
          currentVerifierUser: verifier,
        });
        return true;
      }),
    );
  }

  updateVerifierUserStatuses(verificationBodyId: number, authorities: VerifierAuthorityUpdateDTO[]) {
    return this.verifierAuthoritiesService.updateVerifierAuthoritiesByVerificationBodyId(
      verificationBodyId,
      authorities,
    );
  }

  deleteVerifierUser(userId: string): Observable<void> {
    return this.verifierAuthoritiesService
      .deleteVerifierAuthority(userId)
      .pipe(this.pendingRequestService.trackRequest());
  }

  updateVerifierUsers(authorities: VerifierAuthorityUpdateDTO[]): Observable<boolean> {
    return this.verifierAuthoritiesService
      .updateVerifierAuthorities(authorities)
      .pipe(switchMap(() => this.loadVerifierUsers()));
  }
}
