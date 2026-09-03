import { Service } from '@angular/core';

import { Store } from '@core/store/store';
import { initialState, UserRegistrationState } from '@registration/store/user-registration.state';

@Service()
export class UserRegistrationStore extends Store<UserRegistrationState> {
  constructor() {
    super(initialState);
  }
}
