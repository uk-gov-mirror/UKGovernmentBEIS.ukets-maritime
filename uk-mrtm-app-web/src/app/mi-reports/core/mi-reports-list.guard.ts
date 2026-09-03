import { inject, Service } from '@angular/core';
import { CanActivate, Resolve } from '@angular/router';

import { map, Observable, tap } from 'rxjs';

import { MiReportsService, MiReportSystemSearchResult } from '@mrtm/api';

@Service()
export class MiReportsListGuard implements CanActivate, Resolve<MiReportSystemSearchResult[]> {
  private readonly miReportsService = inject(MiReportsService);

  miReports: MiReportSystemSearchResult[];

  canActivate(): Observable<boolean> {
    return this.miReportsService.getCurrentUserMiReports().pipe(
      tap((result) => (this.miReports = result)),
      map(() => true),
    );
  }

  /**
   * Add a "CUSTOM" report when there is at least one report,
   * since it will never be retrieved from the API
   */
  resolve(): MiReportSystemSearchResult[] {
    return this.miReports
      ? [
          ...this.miReports,
          {
            id: 9999,
            miReportType: 'CUSTOM',
          },
        ]
      : [];
  }
}
