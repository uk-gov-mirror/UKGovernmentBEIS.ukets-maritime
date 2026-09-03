import { inject, Service } from '@angular/core';
import { Resolve } from '@angular/router';

import { Observable } from 'rxjs';

import { RegulatorAuthoritiesService, RegulatorUsersAuthoritiesInfoDTO } from '@mrtm/api';

@Service()
export class RegulatorsGuard implements Resolve<RegulatorUsersAuthoritiesInfoDTO> {
  private readonly regulatorAuthoritiesService = inject(RegulatorAuthoritiesService);

  resolve(): Observable<RegulatorUsersAuthoritiesInfoDTO> {
    return this.regulatorAuthoritiesService.getCaRegulators();
  }
}
