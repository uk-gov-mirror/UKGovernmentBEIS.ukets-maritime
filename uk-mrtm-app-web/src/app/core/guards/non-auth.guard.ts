import { inject, Service } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { first, map, Observable } from 'rxjs';

import { AuthStore, selectIsLoggedIn } from '@netz/common/auth';

import { AuthService } from '@core/services/auth.service';

@Service()
export class NonAuthGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.checkUser().pipe(
      map(() => !this.authStore.select(selectIsLoggedIn)() || this.router.parseUrl('landing')),
      first(),
    );
  }
}
