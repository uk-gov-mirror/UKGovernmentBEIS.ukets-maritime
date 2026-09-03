import { inject, Service } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { Observable, of, switchMap } from 'rxjs';

import { AccountVerificationBodyService } from '@mrtm/api';

import { BusinessErrorService } from '@netz/common/error';

import { appointedVerificationBodyError } from '@accounts/errors';

@Service()
export class AppointVerifierGuard {
  private readonly accountVerificationBodyService = inject(AccountVerificationBodyService);
  private readonly businessErrorService = inject(BusinessErrorService);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const accountId = Number(route.paramMap.get('accountId'));

    return this.accountVerificationBodyService
      .getVerificationBodyOfAccount(accountId)
      .pipe(
        switchMap((vb) =>
          vb ? this.businessErrorService.showError(appointedVerificationBodyError(accountId)) : of(true),
        ),
      );
  }
}
