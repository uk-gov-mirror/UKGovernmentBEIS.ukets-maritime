import { inject, Service } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { first, Observable, switchMap } from 'rxjs';

import { RegulatorCurrentUserDTO, RegulatorUserDTO, RegulatorUsersService, UserDTO, UsersService } from '@mrtm/api';

import { AuthStore, selectUserState } from '@netz/common/auth';
import { BusinessErrorService, catchBadRequest, ErrorCodes } from '@netz/common/error';

import { saveNotFoundRegulatorError } from '@regulators/errors/business-error';

@Service()
export class DeleteResolver implements Resolve<UserDTO | RegulatorUserDTO> {
  private readonly regulatorUsersService = inject(RegulatorUsersService);
  private readonly usersService = inject(UsersService);
  private readonly authStore = inject(AuthStore);
  private readonly businessErrorService = inject(BusinessErrorService);

  resolve(route: ActivatedRouteSnapshot): Observable<UserDTO | RegulatorUserDTO | RegulatorCurrentUserDTO> {
    return this.authStore
      .rxSelect(selectUserState)
      .pipe(
        first(),
        switchMap(({ userId }) =>
          userId === route.paramMap.get('userId')
            ? this.usersService.getCurrentUser()
            : this.regulatorUsersService.getRegulatorUserByCaAndId(route.paramMap.get('userId')),
        ),
      )
      .pipe(
        catchBadRequest(ErrorCodes.AUTHORITY1003, () =>
          this.businessErrorService.showError(saveNotFoundRegulatorError),
        ),
      );
  }
}
