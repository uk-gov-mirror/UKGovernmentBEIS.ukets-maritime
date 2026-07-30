import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { MiReportsService } from '@mrtm/api';

import { mockClass } from '@netz/common/testing';

import { ListOfAccountsUseCaseService } from '@mi-reports/use-cases/list-of-accounts-use-case.service';

describe('ListOfAccountsUseCaseService', () => {
  let service: ListOfAccountsUseCaseService;
  const mockedReportService = mockClass(MiReportsService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ListOfAccountsUseCaseService,
        { provide: MiReportsService, useValue: mockedReportService },
      ],
    });
    service = TestBed.inject(ListOfAccountsUseCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return report columns', () => {
    expect(service.tableColumns()).toHaveLength(15);
    expect(service.tableColumns().map((x) => x.field)).toEqual([
      'Account ID',
      'Account name',
      'Account status',
      'IMO number',
      'Permit ID',
      'Name',
      'User role',
      'User status',
      'Telephone',
      'Email',
      'Last logon',
      'Is User Primary contact?',
      'Is User Service contact?',
      'Is User Financial contact?',
      'Is User Secondary contact?',
    ]);
  });

  it('should fetch data', () => {
    const generateReportSpy = vi.spyOn(mockedReportService, 'generateReport').mockImplementation(() => of(null));

    service.getReportData().subscribe(() => {
      expect(generateReportSpy).toHaveBeenCalled();
    });
  });
});
