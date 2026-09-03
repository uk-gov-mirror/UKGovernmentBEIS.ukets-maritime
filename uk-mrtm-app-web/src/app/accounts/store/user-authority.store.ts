import { inject, Service } from '@angular/core';

import { iif, Observable, tap } from 'rxjs';

import {
  OperatorUserDTO,
  OperatorUserInvitationDTO,
  OperatorUsersInvitationService,
  OperatorUsersService,
  OperatorUserStatusDTO,
} from '@mrtm/api';

import { PendingRequestService } from '@netz/common/services';

import {
  initialCreateUserAuthorityState,
  userAuthorityInitialState,
  UserAuthorityState,
} from '@accounts/store/user-authority.state';
import { Store } from '@core/store';
import { SubmissionError } from '@shared/types';

@Service()
export class UserAuthorityStore extends Store<UserAuthorityState> {
  private readonly operatorUsersInvitationService: OperatorUsersInvitationService =
    inject(OperatorUsersInvitationService);
  private readonly operatorUsersService: OperatorUsersService = inject(OperatorUsersService);
  private readonly pendingRequestService: PendingRequestService = inject(PendingRequestService);

  constructor() {
    super(userAuthorityInitialState);
  }

  setIsInitiallySubmitted(isInitiallySubmitted: boolean): void {
    const state = this.getState();
    this.setState({
      ...state,
      createUserAuthority: {
        ...state.createUserAuthority,
        isInitiallySubmitted,
      },
    });
  }

  setIsSubmitted(isSubmitted: boolean) {
    const state = this.getState();
    this.setState({
      ...state,
      createUserAuthority: {
        ...state.createUserAuthority,
        isSubmitted,
      },
    });
  }

  setNewUserAuthority(newUserAuthority: OperatorUserInvitationDTO): void {
    const state = this.getState();
    this.setState({
      ...state,
      createUserAuthority: {
        ...state.createUserAuthority,
        newUserAuthority: newUserAuthority,
      },
    });
  }

  createUserAuthority(accountId: number, roleCode: string): Observable<void> {
    return this.operatorUsersInvitationService
      .inviteOperatorUserToAccount(accountId, {
        ...this.getState().createUserAuthority.newUserAuthority,
        roleCode,
      })
      .pipe(this.pendingRequestService.trackRequest());
  }

  editUserAuthority(accountId: number, userId: string, userAuthorityDTO: OperatorUserDTO, isCurrentUser = false) {
    return iif(
      () => isCurrentUser,
      this.operatorUsersService.updateCurrentOperatorUser(userAuthorityDTO),
      this.operatorUsersService.updateOperatorUserById(accountId, userId, userAuthorityDTO, 'response'),
    ).pipe(tap(() => this.setCurrentUserAuthority(userAuthorityDTO)));
  }

  setCurrentUserAuthority(currentUserAuthority: OperatorUserStatusDTO): void {
    const state = this.getState();

    this.setState({
      ...state,
      currentUserAuthority: { ...currentUserAuthority },
    });
  }

  setSubmissionErrors(errors: SubmissionError[]) {
    const state = this.getState();
    this.setState({
      ...state,
      createUserAuthority: {
        ...state.createUserAuthority,
        submissionErrors: errors,
      },
    });
  }

  resetCreateUserAuthority(): void {
    const state = this.getState();
    this.setState({
      ...state,
      createUserAuthority: initialCreateUserAuthorityState,
    });
  }
}
