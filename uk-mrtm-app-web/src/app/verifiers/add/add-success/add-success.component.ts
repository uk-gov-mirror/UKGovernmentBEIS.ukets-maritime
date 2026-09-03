import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { map, Observable, take } from 'rxjs';

import { LinkDirective, PanelComponent } from '@netz/govuk-components';

import { selectNewUserAuthority } from '@verifiers/+state/verifier-user.selectors';
import { VerifierUserStore } from '@verifiers/+state/verifier-user.store';

@Component({
  selector: 'mrtm-add-success',
  imports: [AsyncPipe, LinkDirective, PanelComponent, RouterLink],
  standalone: true,
  templateUrl: './add-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSuccessComponent {
  private readonly store: VerifierUserStore = inject(VerifierUserStore);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  userEmail$: Observable<string> = this.store.pipe(
    selectNewUserAuthority,
    map((userAuthority) => userAuthority?.email),
    take(1),
  );
  verificationBodyId$ = this.activatedRoute.queryParamMap.pipe(map((params) => params.get('verificationBodyId')));
}
