import { Service } from '@angular/core';

import { produce } from 'immer';
import { KeycloakProfile } from 'keycloak-js';

import { UserDTO, UserStateDTO, UserTermsVersionDTO } from '@mrtm/api';

import { SignalStore } from '@netz/common/store';

import { AuthState, initialState } from './auth.state';

@Service()
export class AuthStore extends SignalStore<AuthState> {
  constructor() {
    super(initialState);
  }

  setIsLoggedIn(isLoggedIn: boolean) {
    this.setState(
      produce(this.state, (state) => {
        state.isLoggedIn = isLoggedIn;
      }),
    );
  }

  setUser(user: UserDTO) {
    this.setState(
      produce(this.state, (state) => {
        state.user = user;
      }),
    );
  }

  setUserProfile(userProfile: KeycloakProfile) {
    this.setState(
      produce(this.state, (state) => {
        state.userProfile = userProfile;
      }),
    );
  }

  setUserState(userState: UserStateDTO) {
    this.setState(
      produce(this.state, (state) => {
        state.userState = userState;
      }),
    );
  }

  setUserTerms(userTerms: UserTermsVersionDTO) {
    this.setState(
      produce(this.state, (state) => {
        state.userTerms = userTerms;
      }),
    );
  }

  reset(): void {
    this.setState(initialState);
  }
}
