import { inject, Service } from '@angular/core';

import { first, from, map, mergeMap, Observable, shareReplay } from 'rxjs';

import { ReferenceDataService } from '@mrtm/api';

import { Country } from '@core/interfaces';

@Service()
export class CountryService {
  private readonly referenceDataService = inject(ReferenceDataService);

  private countries$: Observable<Country[]> = this.referenceDataService.getReferenceData(['COUNTRIES']).pipe(
    map((response: { COUNTRIES: Country[] }) => response.COUNTRIES as Country[]),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  getUkCountries(): Observable<Country[]> {
    return this.countries$;
  }

  getCountry(code: string): Observable<Country> {
    return this.countries$.pipe(
      mergeMap((countries) => from(countries)),
      first((country) => country.code === code),
    );
  }
}
