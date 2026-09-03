import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { catchError, combineLatest, EMPTY, map, Observable, switchMap, take, tap, throwError } from 'rxjs';

import { OperatorUserInvitationDTO } from '@mrtm/api';

import { PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { ErrorCodes, isBadRequest } from '@netz/common/error';
import { ButtonDirective } from '@netz/govuk-components';

import { UserAccountSummaryInfoComponent } from '@accounts/components';
import { UserAuthorityStore } from '@accounts/store';
import { selectNewUserAuthority } from '@accounts/store/user-authority.selectors';

@Component({
  selector: 'mrtm-create-account-summary',
  imports: [AsyncPipe, PageHeadingComponent, PendingButtonDirective, ButtonDirective, UserAccountSummaryInfoComponent],
  standalone: true,
  templateUrl: './create-user-authority-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserAuthoritySummaryComponent {
  private readonly store: UserAuthorityStore = inject(UserAuthorityStore);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  public userType$ = this.activatedRoute.paramMap.pipe(map((params) => params.get('userType')));
  public summaryInfo$: Observable<OperatorUserInvitationDTO> = combineLatest([
    this.store.pipe(selectNewUserAuthority),
    this.userType$,
  ]).pipe(
    map(([userAuthority, roleCode]) => ({
      ...userAuthority,
      roleCode,
    })),
  );

  handleSubmit(): void {
    this.activatedRoute.paramMap
      .pipe(
        switchMap((params) => this.store.createUserAuthority(Number(params.get('accountId')), params.get('userType'))),
        tap(() => {
          this.store.setIsSubmitted(true);
          this.router.navigate(['../', 'success'], { relativeTo: this.activatedRoute });
        }),
        catchError((res: unknown) => {
          this.store.setIsSubmitted(false);
          if (isBadRequest(res)) {
            switch (res.error?.code) {
              case ErrorCodes.AUTHORITY1005:
                this.store.setSubmissionErrors([
                  {
                    control: 'email',
                    validationErrors: {
                      emailExists: 'The email address of the new user must not already exist at your operator account',
                    },
                  },
                ]);
                this.store.setIsInitiallySubmitted(false);
                this.router.navigate(['../'], { relativeTo: this.activatedRoute });
                break;
              case ErrorCodes.AUTHORITY1016:
              case ErrorCodes.USER1003:
                this.store.setSubmissionErrors([
                  {
                    control: 'email',
                    validationErrors: { emailExists: 'This email address is already linked to a non-operator account' },
                  },
                ]);
                this.store.setIsInitiallySubmitted(false);
                this.router.navigate(['../'], { relativeTo: this.activatedRoute });
                break;
              default:
                return throwError(() => res);
            }
            return EMPTY;
          } else {
            return throwError(() => res);
          }
        }),
        take(1),
      )
      .subscribe();
  }
}
