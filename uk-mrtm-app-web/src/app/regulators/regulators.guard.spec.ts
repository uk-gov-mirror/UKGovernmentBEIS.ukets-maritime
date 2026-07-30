import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { lastValueFrom, of } from 'rxjs';

import { RegulatorAuthoritiesService } from '@mrtm/api';

import { MockType } from '@netz/common/testing';

import { RegulatorsGuard } from '@regulators/regulators.guard';

describe('RegulatorsGuard', () => {
  let guard: RegulatorsGuard;

  const response = { caUsers: [{ userId: 'test1' }, { userId: 'test2' }], editable: false };
  const regulatorAuthoritiesService: MockType<RegulatorAuthoritiesService> = {
    getCaRegulators: vi.fn().mockReturnValue(of(response)),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        RegulatorsGuard,
        { provide: RegulatorAuthoritiesService, useValue: regulatorAuthoritiesService },
      ],
    });
    guard = TestBed.inject(RegulatorsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should resolve and return regulators in dependence offshore CA', async () => {
    const regulatorAuthoritiesServiceSpy = vi.spyOn(regulatorAuthoritiesService, 'getCaRegulators');
    await lastValueFrom(guard.resolve());
    expect(regulatorAuthoritiesServiceSpy).toHaveBeenCalled();
  });
});
