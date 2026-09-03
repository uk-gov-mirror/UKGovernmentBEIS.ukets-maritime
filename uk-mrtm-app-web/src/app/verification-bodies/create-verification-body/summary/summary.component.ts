import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { catchError, EMPTY, throwError } from 'rxjs';

import { PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { ErrorCodes, isBadRequest } from '@netz/common/error';
import { ButtonDirective, LinkDirective } from '@netz/govuk-components';

import { VerificationBodySummaryComponent } from '@shared/components/summaries/verification-body-summary';
import { selectNewVerificationBody } from '@verification-bodies/+state/verification-bodies.selectors';
import { VerificationBodiesStoreService } from '@verification-bodies/+state/verification-bodies-store.service';
import { VerificationBodyAdminUserSummaryComponent } from '@verification-bodies/components';

@Component({
  selector: 'mrtm-summary',
  imports: [
    VerificationBodySummaryComponent,
    ButtonDirective,
    PendingButtonDirective,
    LinkDirective,
    RouterLink,
    PageHeadingComponent,
    AsyncPipe,
    VerificationBodyAdminUserSummaryComponent,
  ],
  standalone: true,
  templateUrl: './summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly router: Router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly store: VerificationBodiesStoreService = inject(VerificationBodiesStoreService);
  public readonly summaryInfo$ = this.store.pipe(selectNewVerificationBody, takeUntilDestroyed(this.destroyRef));

  public handleSubmit(): void {
    this.store
      .createVerificationBody()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err: unknown) => {
          if (!isBadRequest(err)) {
            return throwError(() => err);
          }

          switch (err.error?.code) {
            case ErrorCodes.VERBODY1001:
              this.store.setSubmissionErrors([
                {
                  control: 'accreditationReferenceNumber',
                  validationErrors: {
                    accreditationReferenceNumberExist: 'Enter a unique Accreditation reference number',
                  },
                },
              ]);
              break;
            case ErrorCodes.USER1001:
            case ErrorCodes.AUTHORITY1005:
            case ErrorCodes.AUTHORITY1015:
              this.store.setSubmissionErrors([
                {
                  control: 'adminVerifierUserInvitation.email',
                  validationErrors: { emailExists: 'This user email already exists in the service' },
                },
              ]);
              break;
            default:
              return throwError(() => err);
          }

          this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.store.setIsSubmitted();
        this.router.navigate(['../', 'success'], { relativeTo: this.activatedRoute });
      });
  }
}
