import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { map, Observable, take } from 'rxjs';

import { UserAuthorityInfoDTO } from '@mrtm/api';

import { UserFullNamePipe } from '@netz/common/pipes';
import { LinkDirective, PanelComponent } from '@netz/govuk-components';

import { selectUserAuthority } from '@verifiers/+state/verifier-user.selectors';
import { VerifierUserStore } from '@verifiers/+state/verifier-user.store';

@Component({
  selector: 'mrtm-success',
  imports: [AsyncPipe, LinkDirective, PanelComponent, RouterLink, UserFullNamePipe],
  standalone: true,
  templateUrl: './success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessComponent {
  private readonly store: VerifierUserStore = inject(VerifierUserStore);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  userInfo$: Observable<UserAuthorityInfoDTO> = this.store.pipe(
    selectUserAuthority,
    map((userAuthority) => userAuthority),
    take(1),
  );
  verificationBodyId$ = this.activatedRoute.queryParamMap.pipe(map((params) => params.get('verificationBodyId')));
}
