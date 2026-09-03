import { inject, Service } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { Observable } from 'rxjs';

import { CaExternalContactDTO } from '@mrtm/api';

import { BusinessErrorService, catchBadRequest, ErrorCodes } from '@netz/common/error';

import { saveNotFoundExternalContactError } from '@regulators/errors/business-error';
import { DetailsGuard } from '@regulators/external-contacts/details/details.guard';

@Service()
export class DeleteGuard {
  private readonly externalContactDetailsGuard = inject(DetailsGuard);
  private readonly businessErrorService = inject(BusinessErrorService);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.externalContactDetailsGuard
      .isExternalContactActive(route)
      .pipe(
        catchBadRequest(ErrorCodes.EXTCONTACT1000, () =>
          this.businessErrorService.showError(saveNotFoundExternalContactError),
        ),
      );
  }

  resolve(): CaExternalContactDTO {
    return this.externalContactDetailsGuard.resolve();
  }
}
