import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EMPTY, map, take } from 'rxjs';

import { PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { BusinessErrorService, catchBadRequest, catchElseRethrow, ErrorCodes, HttpStatuses } from '@netz/common/error';
import { ButtonDirective } from '@netz/govuk-components';

import { UserAccountSummaryInfoComponent } from '@shared/components';
import {
  disabledVerificationBodyError,
  saveNotFoundVerificationBodyError,
} from '@verification-bodies/errors/business-error';
import { selectNewUserAuthority } from '@verifiers/+state/verifier-user.selectors';
import { VerifierUserStore } from '@verifiers/+state/verifier-user.store';

@Component({
  selector: 'mrtm-add-summary',
  imports: [UserAccountSummaryInfoComponent, AsyncPipe, PageHeadingComponent, ButtonDirective, PendingButtonDirective],
  standalone: true,
  templateUrl: './add-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSummaryComponent {
  private readonly store: VerifierUserStore = inject(VerifierUserStore);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly businessErrorService = inject(BusinessErrorService);
  public summaryInfo$ = this.store.pipe(selectNewUserAuthority, take(1));

  public readonly formHint$ = this.activatedRoute.paramMap.pipe(
    map((params) => {
      const userType = params.get('userType');

      return userType === 'verifier_admin' ? 'Add a new verifier admin' : 'Add a new user';
    }),
    take(1),
  );

  public handleSubmit(): void {
    const verificationBodyId = this.activatedRoute.snapshot.queryParamMap.has('verificationBodyId')
      ? Number(this.activatedRoute.snapshot.queryParamMap.get('verificationBodyId'))
      : null;

    const userType = this.activatedRoute.snapshot.paramMap.get('userType');

    this.store
      .createUserAuthority(verificationBodyId, userType)
      .pipe(
        catchBadRequest([ErrorCodes.USER1001, ErrorCodes.AUTHORITY1005, ErrorCodes.AUTHORITY1015], () => {
          this.store.setSubmissionErrors([
            {
              control: 'email',
              validationErrors: { emailExists: 'This user email already exists in the service' },
            },
          ]);

          this.router.navigate(['../'], { relativeTo: this.activatedRoute, queryParamsHandling: 'merge' });
          return EMPTY;
        }),
        catchBadRequest(ErrorCodes.VERBODY1003, () =>
          this.businessErrorService.showError(disabledVerificationBodyError),
        ),
        catchElseRethrow(
          (error) => error.status === HttpStatuses.NotFound,
          () => this.businessErrorService.showError(saveNotFoundVerificationBodyError),
        ),
      )
      .subscribe(() => {
        this.router.navigate(['../success'], { relativeTo: this.activatedRoute, queryParamsHandling: 'merge' });
      });
  }
}
