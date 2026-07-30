import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EmptyError, of, throwError } from 'rxjs';

import { mockClass } from '@netz/common/testing';

import { Country } from '@core/interfaces/country.interface';
import { CountryService } from '@core/services/country.service';
import { CountryPipe } from '@shared/pipes';

describe('CountryPipe', () => {
  let pipe: CountryPipe;
  const changeDetectorSpy = {
    markForCheck: vi.fn(),
  };

  const COUNTRIES: Record<string, Country> = {
    PT: {
      code: 'PT',
      name: 'Portugal',
      officialName: 'The Portuguese Republic',
    },
    PW: {
      code: 'PW',
      name: 'Palau',
      officialName: 'The Republic of Palau',
    },
    GB: {
      code: 'GB',
      name: 'United Kingdom',
      officialName: 'United Kingdom',
    },
  };

  const countryService = mockClass(CountryService);
  countryService.getCountry.mockImplementation((code) => {
    return COUNTRIES[code] ? of(COUNTRIES[code]) : throwError(() => new EmptyError());
  });

  function transformCode(code: string): string {
    pipe.transform(code);
    return pipe.transform(code);
  }

  beforeEach(() => {
    changeDetectorSpy.markForCheck.mockReset();

    TestBed.configureTestingModule({
      imports: [CountryPipe],
      providers: [
        { provide: CountryService, useValue: countryService },
        { provide: ChangeDetectorRef, useValue: changeDetectorSpy },
      ],
    });

    TestBed.runInInjectionContext(() => (pipe = new CountryPipe()));
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the country name', () => {
    expect(transformCode('GB')).toEqual('United Kingdom');
  });

  it('should return invalid country if country is not found', () => {
    expect(transformCode('GO')).toEqual('Invalid country');
  });

  it('should return empty string if not EmptyError', () => {
    countryService.getCountry.mockImplementation(() => throwError(() => new Error()));
    expect(transformCode('GO')).toEqual('');
  });
});
