import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CountryService } from '@core/services/country.service';
import { CountryServiceStub } from '@registration/testing/country-service-stub';
import { PhoneNumberPipe } from '@shared/pipes';

describe('PhoneNumberPipe', () => {
  let pipe: PhoneNumberPipe;
  const changeDetectorSpy = {
    markForCheck: vi.fn(),
  };

  function transformCode(callingCode: string): string {
    pipe.transform(callingCode);
    return pipe.transform(callingCode);
  }

  beforeEach(() => {
    changeDetectorSpy.markForCheck.mockReset();

    TestBed.configureTestingModule({
      declarations: [PhoneNumberPipe],
      providers: [
        { provide: CountryService, useClass: CountryServiceStub },
        { provide: ChangeDetectorRef, useValue: changeDetectorSpy },
      ],
    });
  });

  beforeEach(() => (pipe = new PhoneNumberPipe()));

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the country code and calling code', () => {
    expect(transformCode('30')).toEqual('GR (30)');
  });

  it('should return invalid country if country is not found', () => {
    expect(transformCode('12')).toEqual('ZZ (12)');
  });
});
