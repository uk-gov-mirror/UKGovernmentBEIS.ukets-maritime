import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { BehaviorSubject, EMPTY, map } from 'rxjs';

import { MiReportsUserDefinedService } from '@mrtm/api';

import { PageHeadingComponent } from '@netz/common/components';
import { catchBadRequest, ErrorCodes as BusinessErrorCode } from '@netz/common/error';
import { DestroySubject, PendingRequestService } from '@netz/common/services';
import { ButtonDirective, GovukValidators, TextareaComponent } from '@netz/govuk-components';

import { ExtendedMiReportResult } from '@mi-reports/core/mi-interfaces';
import { manipulateResultsAndExportToExcel } from '@mi-reports/core/mi-report';

@Component({
  selector: 'mrtm-custom',
  imports: [PageHeadingComponent, ReactiveFormsModule, TextareaComponent, ButtonDirective, AsyncPipe],
  standalone: true,
  templateUrl: './custom.component.html',
  providers: [DestroySubject],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomReportComponent {
  private readonly fb = inject(FormBuilder);
  private readonly miReportsUserDefinedService = inject(MiReportsUserDefinedService);
  readonly pendingRequest = inject(PendingRequestService);

  errorMessage$ = new BehaviorSubject<string>(null);

  reportOptionsForm: FormGroup = this.fb.group({
    query: [null, [GovukValidators.required('Query must not be empty')]],
  });

  exportToExcel() {
    if (this.reportOptionsForm.valid) {
      this.miReportsUserDefinedService
        .generateCustomReport({
          sqlQuery: this.reportOptionsForm.get('query').value,
        })
        .pipe(
          this.pendingRequest.trackRequest(),
          catchBadRequest(BusinessErrorCode.REPORT1001, (res) => {
            this.errorMessage$.next(res.error.message);
            return EMPTY;
          }),
        )
        .pipe(
          map((results: ExtendedMiReportResult) => {
            manipulateResultsAndExportToExcel(results, 'Custom sql report');
          }),
        )
        .subscribe({
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          next: (_) => this.errorMessage$.next(null),
          error: (err) => this.errorMessage$.next(err.message),
        });
    }
  }
}
