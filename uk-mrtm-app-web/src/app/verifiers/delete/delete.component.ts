import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { catchError, combineLatest, map, switchMap, take, throwError } from 'rxjs';

import { PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { BusinessErrorService, catchBadRequest, ErrorCodes, isBadRequest } from '@netz/common/error';
import { UserFullNamePipe } from '@netz/common/pipes';
import { ButtonDirective, LinkDirective, WarningTextComponent } from '@netz/govuk-components';

import { deleteUniqueActiveVerifierError } from '@shared/errors';
import { isNil } from '@shared/utils';
import { selectUserAuthority } from '@verifiers/+state/verifier-user.selectors';
import { VerifierUserStore } from '@verifiers/+state/verifier-user.store';
import { saveNotFoundVerifierError } from '@verifiers/errors/business-error';

@Component({
  selector: 'mrtm-delete',
  imports: [
    ButtonDirective,
    LinkDirective,
    PageHeadingComponent,
    PendingButtonDirective,
    WarningTextComponent,
    RouterLink,
    AsyncPipe,
    UserFullNamePipe,
  ],
  standalone: true,
  templateUrl: './delete.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteComponent {
  private readonly store: VerifierUserStore = inject(VerifierUserStore);
  private readonly businessErrorService: BusinessErrorService = inject(BusinessErrorService);
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  public readonly verifierUserInfo$ = this.store.pipe(selectUserAuthority, take(1));
  public readonly verificationBodyId$ = this.activatedRoute.queryParamMap.pipe(
    map((params) => (params.has('verificationBodyId') ? Number(params.get('verificationBodyId')) : null)),
  );
  public readonly cancelLink$ = combineLatest([this.verificationBodyId$, this.activatedRoute.paramMap]).pipe(
    take(1),
    map(([verificationBodyId, paramMap]) => {
      const userId = paramMap.get('userId');

      return this.router.serializeUrl(
        !isNil(verificationBodyId)
          ? this.router.createUrlTree(['/verification-bodies', verificationBodyId])
          : this.router.createUrlTree(['/user/verifiers', userId]),
      );
    }),
  );

  public handleDelete(): void {
    this.activatedRoute.paramMap
      .pipe(
        switchMap((params) => this.store.deleteVerifierUser(params.get('userId'))),
        take(1),
        catchBadRequest([ErrorCodes.AUTHORITY1013, ErrorCodes.AUTHORITY1006], () =>
          this.businessErrorService.showError(saveNotFoundVerifierError),
        ),
        catchError((err: unknown) => {
          if (!isBadRequest(err)) {
            return throwError(() => err);
          }

          switch (err?.error?.code) {
            case ErrorCodes.AUTHORITY1007:
              return this.verificationBodyId$.pipe(
                switchMap((verificationBodyId) =>
                  this.businessErrorService.showError(deleteUniqueActiveVerifierError(verificationBodyId)),
                ),
              );
            default:
              return throwError(() => err);
          }
        }),
      )
      .subscribe(() => {
        this.router.navigate(['success'], { relativeTo: this.activatedRoute, queryParamsHandling: 'merge' });
      });
  }
}
