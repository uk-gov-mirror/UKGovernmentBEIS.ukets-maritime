import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';

import { UserRegistrationStore } from '@registration/store/user-registration.store';

@Service()
export class ConfirmedEmailGuard {
  private store = inject(UserRegistrationStore);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.store.getState().token) {
      return true;
    }
    this.router.navigateByUrl('/');
    return false;
  }
}
