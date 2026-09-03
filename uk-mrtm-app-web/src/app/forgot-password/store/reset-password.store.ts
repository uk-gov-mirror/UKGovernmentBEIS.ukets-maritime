import { Service } from '@angular/core';

import { Store } from '@core/store/store';
import { initialState, ResetPasswordState } from '@forgot-password/store/reset-password.state';

@Service()
export class ResetPasswordStore extends Store<ResetPasswordState> {
  constructor() {
    super(initialState);
  }
}
