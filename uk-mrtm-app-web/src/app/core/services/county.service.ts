import { inject, Service } from '@angular/core';

import { map, Observable, shareReplay } from 'rxjs';

import { ReferenceDataService } from '@mrtm/api';

import { County } from '@core/interfaces/county.interface';

@Service()
export class CountyService {
  private readonly referenceDataService = inject(ReferenceDataService);

  private counties$: Observable<County[]> = this.referenceDataService.getReferenceData(['COUNTIES']).pipe(
    map((response: { COUNTIES: County[] }) => response.COUNTIES as County[]),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  getUkCounties(): Observable<County[]> {
    return this.counties$;
  }
}
