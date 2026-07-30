import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { MiReportsService } from '@mrtm/api';

import { mockClass } from '@netz/common/testing';

import { RegulatorOutstandingRequestTasksUseCaseService } from '@mi-reports/use-cases/regulator-outstanding-request-tasks-use-case.service';

describe('RegulatorOutstandingRequestTasksUseCaseService', () => {
  let service: RegulatorOutstandingRequestTasksUseCaseService;
  const mockedReportService = mockClass(MiReportsService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        RegulatorOutstandingRequestTasksUseCaseService,
        { provide: MiReportsService, useValue: mockedReportService },
      ],
    });
    service = TestBed.inject(RegulatorOutstandingRequestTasksUseCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return report columns', () => {
    expect(service.tableColumns()).toHaveLength(10);
    expect(service.tableColumns().map((x) => x.field)).toEqual([
      'Account ID',
      'Account name',
      'Account status',
      'IMO number',
      'Workflow ID',
      'Workflow type',
      'Workflow task assignee',
      'Workflow task due date',
      'Workflow task days remaining',
      'Workflow task name',
    ]);
  });

  it('should fetch data', () => {
    const generateReportSpy = vi.spyOn(mockedReportService, 'generateReport').mockImplementation(() => of(null));

    service.getReportData().subscribe(() => {
      expect(generateReportSpy).toHaveBeenCalled();
    });
  });
});
