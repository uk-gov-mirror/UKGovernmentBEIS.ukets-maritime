import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { combineLatest, map, of, switchMap } from 'rxjs';

import { AuthStore, selectUserId } from '@netz/common/auth';

import {
  EDIT_USER_AUTHORITY_FORM,
  editUserAuthorityFormProvider,
} from '@accounts/containers/edit-user-authority/edit-user-authority.form-provider';
import { UserAuthorityStore } from '@accounts/store';
import { UserAccountFormComponent, WizardStepComponent } from '@shared/components';

@Component({
  selector: 'mrtm-edit-user-authority',
  imports: [WizardStepComponent, ReactiveFormsModule, UserAccountFormComponent],
  standalone: true,
  templateUrl: './edit-user-authority.component.html',
  styles: `
    .break-line {
      white-space: pre-line;
    }
  `,
  providers: [editUserAuthorityFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserAuthorityComponent {
  readonly form = inject<FormGroup>(EDIT_USER_AUTHORITY_FORM);
  private readonly store: UserAuthorityStore = inject(UserAuthorityStore);
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly router: Router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  handleSubmit(): void {
    (this.form.dirty
      ? combineLatest([
          this.authStore.rxSelect(selectUserId),
          this.activatedRoute.paramMap.pipe(map((params) => params.get('userId'))),
          this.activatedRoute.paramMap.pipe(map((params) => Number(params.get('accountId')))),
        ]).pipe(
          switchMap(([userId, routeUserId, accountId]) =>
            this.store.editUserAuthority(accountId, routeUserId, this.form.getRawValue(), userId === routeUserId),
          ),
        )
      : of<any>(true)
    ).subscribe(() =>
      this.router.navigate(['../'], {
        relativeTo: this.activatedRoute,
        queryParams: this.form.dirty ? { saveCompleted: true } : undefined,
      }),
    );
  }
}
