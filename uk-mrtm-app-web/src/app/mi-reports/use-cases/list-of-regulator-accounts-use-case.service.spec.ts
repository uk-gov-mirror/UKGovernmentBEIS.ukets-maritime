import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { MiReportsService } from '@mrtm/api';

import { mockClass } from '@netz/common/testing';

import { ListOfRegulatorAccountsUseCaseService } from '@mi-reports/use-cases/list-of-regulator-accounts-use-case.service';

describe('ListOfRegulatorAccountsUseCaseService', () => {
  let service: ListOfRegulatorAccountsUseCaseService;
  const mockedReportService = mockClass(MiReportsService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ListOfRegulatorAccountsUseCaseService,
        { provide: MiReportsService, useValue: mockedReportService },
      ],
    });
    service = TestBed.inject(ListOfRegulatorAccountsUseCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return report columns', () => {
    expect(service.tableColumns()).toHaveLength(6);
    expect(service.tableColumns().map((x) => x.field)).toEqual([
      'Account ID',
      'Account name',
      'Account status',
      'IMO number',
      'User status',
      'Assigned regulator',
    ]);
  });

  it('should fetch data', () => {
    const generateReportSpy = vi.spyOn(mockedReportService, 'generateReport').mockImplementation(() => of(null));

    service.getReportData().subscribe(() => {
      expect(generateReportSpy).toHaveBeenCalled();
    });
  });
});
