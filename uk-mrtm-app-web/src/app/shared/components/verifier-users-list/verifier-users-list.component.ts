import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormGroup, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Observable } from 'rxjs';

import { UserAuthorityInfoDTO, VerifierAuthorityUpdateDTO } from '@mrtm/api';

import { AuthStore, selectUserId, selectUserRoleType } from '@netz/common/auth';
import { PendingButtonDirective } from '@netz/common/directives';
import { UserFullNamePipe } from '@netz/common/pipes';
import {
  ButtonDirective,
  DetailsComponent,
  LinkDirective,
  SelectComponent,
  TableComponent,
} from '@netz/govuk-components';

import {
  VERIFIER_USERS_LIST_FORM,
  verifierUsersListFormProvider,
} from '@shared/components/verifier-users-list/verifier-users.form-provider';
import {
  VERIFIER_USER_STATUSES,
  VERIFIER_USER_STATUSES_ACCEPTED,
  VERIFIER_USER_TYPES,
  VERIFIER_USERS_LIST_COLUMNS,
} from '@shared/components/verifier-users-list/verifier-users-list.constants';
import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-verifier-users-list',
  imports: [
    AsyncPipe,
    ButtonDirective,
    ReactiveFormsModule,
    TableComponent,
    LinkDirective,
    RouterLink,
    UserFullNamePipe,
    SelectComponent,
    PendingButtonDirective,
    DetailsComponent,
  ],
  standalone: true,
  templateUrl: './verifier-users-list.component.html',
  providers: [verifierUsersListFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifierUsersListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly formBuilder = inject(UntypedFormBuilder);
  private readonly formCreator =
    inject<(authorities: UserAuthorityInfoDTO[]) => UntypedFormGroup>(VERIFIER_USERS_LIST_FORM);
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly editVerifierSubpath = input<string>('/user/verifiers');
  readonly verificationBodyId = input<number>();
  readonly editable = input<boolean>(false);
  readonly authorities = input.required<Observable<UserAuthorityInfoDTO[]>>();

  public form: UntypedFormGroup;
  public readonly verifierUserStatuses = VERIFIER_USER_STATUSES;
  public readonly verifierUsersAcceptedStatuses = VERIFIER_USER_STATUSES_ACCEPTED;
  public readonly verifierUserTypes = VERIFIER_USER_TYPES;
  public readonly tableColumns = VERIFIER_USERS_LIST_COLUMNS;
  public readonly readonlyTableColumns = VERIFIER_USERS_LIST_COLUMNS.slice(0, 2);
  readonly saveChanges = output<{
    authoritiesToUpdate: VerifierAuthorityUpdateDTO[];
    form: FormGroup;
  }>();
  readonly discardChanges = output<void>();
  public readonly addNewUserForm = this.formBuilder.group({
    roleCode: ['verifier'],
  });
  public readonly userRole = toSignal(this.authStore.rxSelect(selectUserRoleType));
  public readonly userId = toSignal(this.authStore.rxSelect(selectUserId));

  public ngOnInit(): void {
    this.authorities()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        if (isNil(this.form)) {
          this.form = this.formCreator(items);
        }

        this.form.reset({
          verifierUsers: items,
        });
      });
  }

  public getTempDisabledStatuses(index: number) {
    if ((this.form.get('verifierUsers') as FormArray).at(index).pristine) {
      // When the status is set automatically to TEMP_DISABLED, replace the default DISABLED option with one of value
      // TEMP_DISABLED.
      const statuses = this.verifierUserStatuses.filter((status) => status.value !== 'DISABLED');
      statuses.push({ text: 'Disabled', value: 'TEMP_DISABLED' });
      return statuses;
    } else {
      // When the status is set manually, use the default verifier statuses.
      return this.verifierUserStatuses;
    }
  }

  public handleSubmit(): void {
    const verificationBodiesStatuses: VerifierAuthorityUpdateDTO[] = (
      this.form.get('verifierUsers').value as VerifierAuthorityUpdateDTO[]
    ).filter((verifier) => verifier.authorityStatus !== 'PENDING');
    if (!this.form.valid || !this.form.dirty || verificationBodiesStatuses.length === 0) {
      return;
    }

    this.saveChanges.emit({
      authoritiesToUpdate: verificationBodiesStatuses,
      form: this.form,
    });
  }

  public handleDiscardChanges(): void {
    if (!this.form.dirty) {
      return;
    }
    // TODO: The 'emit' function requires a mandatory void argument
    this.discardChanges.emit();
  }

  public addNewUser(): void {
    this.router.navigate(['/user/verifiers/add', this.addNewUserForm.value.roleCode]);
  }
}
