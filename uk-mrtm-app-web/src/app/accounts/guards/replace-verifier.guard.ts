import { inject, Service } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { map, Observable, tap } from 'rxjs';

import { AccountVerificationBodyService, VerificationBodyNameInfoDTO } from '@mrtm/api';

import { BusinessErrorService, catchElseRethrow, HttpStatuses } from '@netz/common/error';

import { viewNotFoundOperatorError } from '@accounts/errors';

@Service()
export class ReplaceVerifierGuard {
  private readonly accountVerificationBodyService = inject(AccountVerificationBodyService);
  private readonly businessErrorService = inject(BusinessErrorService);
  private verificationBodyNameInfo: VerificationBodyNameInfoDTO;

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const accountId = Number(route.paramMap.get('accountId'));

    return this.accountVerificationBodyService.getVerificationBodyOfAccount(accountId).pipe(
      tap((res) => (this.verificationBodyNameInfo = res)),
      map(() => true),
      catchElseRethrow(
        (error) => error.status === HttpStatuses.NotFound,
        () => this.businessErrorService.showError(viewNotFoundOperatorError(accountId)),
      ),
    );
  }

  resolve(): VerificationBodyNameInfoDTO {
    return this.verificationBodyNameInfo;
  }
}
