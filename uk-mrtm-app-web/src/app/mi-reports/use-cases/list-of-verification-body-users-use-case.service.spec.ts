import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { MiReportsService } from '@mrtm/api';

import { mockClass } from '@netz/common/testing';

import { ListOfVerificationBodyUsersUseCaseService } from '@mi-reports/use-cases/list-of-verification-body-users-use-case.service';

describe('ListOfVerificationBodyUsersUseCaseService', () => {
  let service: ListOfVerificationBodyUsersUseCaseService;
  const mockedReportService = mockClass(MiReportsService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ListOfVerificationBodyUsersUseCaseService,
        { provide: MiReportsService, useValue: mockedReportService },
      ],
    });
    service = TestBed.inject(ListOfVerificationBodyUsersUseCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return report columns', () => {
    expect(service.tableColumns()).toHaveLength(9);
    expect(service.tableColumns().map((x) => x.field)).toEqual([
      'Verification body name',
      'Account status',
      'Accreditation reference number',
      'User role',
      'User status',
      'Name',
      'Email',
      'Telephone',
      'Last login',
    ]);
  });

  it('should fetch data', () => {
    const generateReportSpy = vi.spyOn(mockedReportService, 'generateReport').mockImplementation(() => of(null));

    service.getReportData().subscribe(() => {
      expect(generateReportSpy).toHaveBeenCalled();
    });
  });
});
