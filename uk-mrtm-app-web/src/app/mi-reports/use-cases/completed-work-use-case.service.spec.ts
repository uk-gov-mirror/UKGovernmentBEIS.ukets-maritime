import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { MiReportsService } from '@mrtm/api';

import { mockClass } from '@netz/common/testing';

import { CompletedWorkUseCaseService } from '@mi-reports/use-cases/completed-work-use-case.service';

describe('CompletedWorkUseCaseService', () => {
  let service: CompletedWorkUseCaseService;
  const mockedReportService = mockClass(MiReportsService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CompletedWorkUseCaseService,
        { provide: MiReportsService, useValue: mockedReportService },
      ],
    });
    service = TestBed.inject(CompletedWorkUseCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return report columns', () => {
    expect(service.tableColumns()).toHaveLength(11);
    expect(service.tableColumns().map((x) => x.field)).toEqual([
      'Account ID',
      'Account name',
      'Account status',
      'IMO number',
      'EMP ID',
      'Workflow ID',
      'Workflow type',
      'Workflow status',
      'Timeline event type',
      'Timeline event Completed by',
      'Timeline event Date Completed',
    ]);
  });

  it('should fetch data', () => {
    const generateReportSpy = vi.spyOn(mockedReportService, 'generateReport').mockImplementation(() => of(null));

    service.getReportData({ option: 'ANNUAL', year: 2023 }).subscribe(() => {
      expect(generateReportSpy).toHaveBeenCalled();
    });
  });
});
