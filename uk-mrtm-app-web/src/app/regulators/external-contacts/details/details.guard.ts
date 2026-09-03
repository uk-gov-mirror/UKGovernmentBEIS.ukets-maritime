import { inject, Service } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { map, Observable, tap } from 'rxjs';

import { CaExternalContactDTO, CaExternalContactsService } from '@mrtm/api';

import { BusinessErrorService, catchBadRequest, ErrorCodes } from '@netz/common/error';

import { viewNotFoundExternalContactError } from '@regulators/errors/business-error';

@Service()
export class DetailsGuard {
  private readonly caExternalContactsService = inject(CaExternalContactsService);
  private readonly businessErrorService = inject(BusinessErrorService);

  private externalContact: CaExternalContactDTO;

  isExternalContactActive(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.caExternalContactsService.getCaExternalContactById(Number(route.paramMap.get('userId'))).pipe(
      tap((contact) => (this.externalContact = contact)),
      map(() => true),
    );
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.isExternalContactActive(route).pipe(
      catchBadRequest(ErrorCodes.EXTCONTACT1000, () =>
        this.businessErrorService.showError(viewNotFoundExternalContactError),
      ),
    );
  }

  resolve(): CaExternalContactDTO {
    return this.externalContact;
  }
}
