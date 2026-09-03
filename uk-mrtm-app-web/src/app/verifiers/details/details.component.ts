import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { combineLatest, map, take, tap } from 'rxjs';

import { AuthStore, selectUserId } from '@netz/common/auth';
import { PageHeadingComponent } from '@netz/common/components';
import { UserFullNamePipe } from '@netz/common/pipes';
import { NotificationBannerComponent } from '@netz/govuk-components';

import { TwoFaLinkComponent, UserAccountSummaryInfoComponent } from '@shared/components';
import { selectUserAuthority } from '@verifiers/+state/verifier-user.selectors';
import { VerifierUserStore } from '@verifiers/+state/verifier-user.store';

@Component({
  selector: 'mrtm-edit',
  imports: [
    AsyncPipe,
    NotificationBannerComponent,
    PageHeadingComponent,
    TwoFaLinkComponent,
    UserAccountSummaryInfoComponent,
    UserFullNamePipe,
  ],
  standalone: true,
  templateUrl: './details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsComponent {
  private readonly router: Router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly store = inject(VerifierUserStore);
  public readonly userId$ = this.activatedRoute.paramMap.pipe(map((params) => params.get('userId')));
  public readonly isCurrentUser$ = combineLatest([this.userId$, this.authStore.rxSelect(selectUserId)]).pipe(
    map(([routeUserId, authUserId]) => routeUserId === authUserId),
  );
  public readonly accountId$ = this.activatedRoute.paramMap.pipe(map((params) => Number(params.get('accountId'))));
  public readonly successBoxVisible$ = this.activatedRoute.queryParamMap.pipe(
    take(1),
    map((queryParams) => Boolean(queryParams.get('saveCompleted') ?? false)),
    tap((hasSuccess) => {
      if (hasSuccess) {
        this.router.navigate([], { relativeTo: this.activatedRoute });
      }
    }),
  );

  public readonly currentUser$ = this.store.pipe(selectUserAuthority);
}
