import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Signal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { MiReportsService } from '@mrtm/api';

import { mockClass } from '@netz/common/testing';
import { GovukTableColumn } from '@netz/govuk-components';

import { MiReportType } from '@mi-reports/core/mi-report-type.enum';
import { MiReportUseCaseService } from '@mi-reports/use-cases/common/mi-report-use-case.service';

describe('MiReportUseCaseService', () => {
  class TestUseCaseService extends MiReportUseCaseService {
    public reportType: MiReportType = MiReportType.COMPLETED_WORK;
    public columnValueMapper: Record<string, (value: unknown) => unknown> = {};
    public readonly tableColumns: Signal<GovukTableColumn[]> = signal([
      { field: 'Col 1', header: 'Column 1' },
      { field: 'Col 2', header: 'Column 2' },
      { field: 'Col 3', header: 'Column 3' },
    ]);
  }

  let service: TestUseCaseService;
  const mockedReportService = mockClass(MiReportsService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TestUseCaseService,
        { provide: MiReportsService, useValue: mockedReportService },
      ],
    });
    service = TestBed.inject(TestUseCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return report columns', () => {
    expect(service.tableColumns()).toHaveLength(3);
    expect(service.tableColumns().map((x) => x.field)).toEqual(['Col 1', 'Col 2', 'Col 3']);
  });

  it('should fetch data', () => {
    const generateReportSpy = vi.spyOn(mockedReportService, 'generateReport').mockImplementation(() => of(null));

    service.getReportData().subscribe(() => {
      expect(generateReportSpy).toHaveBeenCalled();
    });
  });
});
