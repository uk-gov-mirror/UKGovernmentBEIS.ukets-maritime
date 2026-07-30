import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { combineLatest, map, of, ReplaySubject, shareReplay, switchMap, takeUntil, tap } from 'rxjs';

import {
  AccountThirdPartyDataProvidersService,
  AccountVerificationBodyService,
  AuthoritiesService,
  MrtmAccountStatus,
  OperatorAuthoritiesService,
  UserAuthorityInfoDTO,
} from '@mrtm/api';

import { AuthStore, selectUserId, selectUserRoleType } from '@netz/common/auth';
import { FeedbackBannerStore } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { BusinessErrorService, catchBadRequest, catchElseRethrow, ErrorCodes, HttpStatuses } from '@netz/common/error';
import { UserFullNamePipe } from '@netz/common/pipes';
import { DestroySubject } from '@netz/common/services';
import {
  ButtonDirective,
  DetailsComponent,
  GovukSelectOption,
  GovukTableColumn,
  LinkDirective,
  SelectComponent,
  TableComponent,
} from '@netz/govuk-components';

import {
  authorityStatusAcceptedOptions,
  authorityStatusOptions,
  editableCols,
  userTypeOptions,
} from '@accounts/components/user-contacts-verifiers-tab/user-contacts-verifiers-tab.constants';
import {
  USER_CONTACTS_VERIFIERS_FORM,
  userContactsVerifiersTabFormProvider,
} from '@accounts/components/user-contacts-verifiers-tab/user-contacts-verifiers-tab.form-provider';
import { savePartiallyNotFoundOperatorError } from '@accounts/errors';
import { OperatorAccountsStore, selectAccount } from '@accounts/store';
import { RadioOptionComponent } from '@shared/components';
import { ScrollablePaneDirective, UsersTableDirective } from '@shared/directives';
import { IncludesPipe } from '@shared/pipes';
import { FormUtils } from '@shared/utils/form.utils';

@Component({
  selector: 'mrtm-user-contacts-verifiers-tab',
  imports: [
    DetailsComponent,
    SelectComponent,
    ReactiveFormsModule,
    ButtonDirective,
    AsyncPipe,
    TableComponent,
    RouterLink,
    PendingButtonDirective,
    IncludesPipe,
    UserFullNamePipe,
    LinkDirective,
    RadioOptionComponent,
    UsersTableDirective,
    ScrollablePaneDirective,
  ],
  standalone: true,
  templateUrl: './user-contacts-verifiers-tab.component.html',
  providers: [userContactsVerifiersTabFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserContactsVerifiersTabComponent implements OnInit {
  readonly usersForm = inject<UntypedFormGroup>(USER_CONTACTS_VERIFIERS_FORM);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly authoritiesService = inject(AuthoritiesService);
  private readonly operatorAuthoritiesService = inject(OperatorAuthoritiesService);
  private readonly operatorAccountsStore = inject(OperatorAccountsStore);
  private readonly accountVerificationBodyService = inject(AccountVerificationBodyService);
  private readonly accountThirdPartyDataProvidersService = inject(AccountThirdPartyDataProvidersService);
  private readonly businessErrorService = inject(BusinessErrorService);
  private readonly router = inject(Router);
  private readonly destroy$ = inject(DestroySubject);
  private readonly route = inject(ActivatedRoute);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);

  readonly currentTab = input<string>();

  private accountId = Number(this.route.snapshot.paramMap.get('accountId'));

  addUserForm: UntypedFormGroup = this.fb.group({ userType: ['operator'] });
  editableCols: GovukTableColumn[] = editableCols;
  nonEditableCols: GovukTableColumn[] = editableCols.slice(0, 6);
  userTypes: GovukSelectOption<string>[] = userTypeOptions;
  authorityStatuses: GovukSelectOption<UserAuthorityInfoDTO['authorityStatus']>[] = authorityStatusOptions;
  authorityStatusesAccepted: GovukSelectOption<UserAuthorityInfoDTO['authorityStatus']>[] =
    authorityStatusAcceptedOptions;

  roleType = this.authStore.select(selectUserRoleType);
  userId = this.authStore.select(selectUserId);
  refresh$ = new ReplaySubject<void>(1);
  operatorsManagement$ = this.refresh$.pipe(
    switchMap(() => this.operatorAuthoritiesService.getAccountOperatorAuthorities(this.accountId)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  isAccountClosed$ = this.operatorAccountsStore.pipe(
    selectAccount,
    map((account) => account?.status === MrtmAccountStatus.CLOSED),
  );
  readonly isEditable = toSignal(this.operatorsManagement$.pipe(map((operators) => operators.editable)));
  verificationBody$ = this.accountVerificationBodyService.getVerificationBodyOfAccount(this.accountId).pipe(
    catchElseRethrow(
      (error) => error.status === HttpStatuses.NotFound,
      () => of(null),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  readonly hasVerificationBody = toSignal(this.verificationBody$.pipe(map((value) => !!value)));

  dataSupplier = this.accountThirdPartyDataProvidersService.getThirdPartyDataProviderOfAccount(this.accountId).pipe(
    catchElseRethrow(
      (error) => error.status === HttpStatuses.NotFound,
      () => of(null),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly hasDataSupplier = toSignal(this.dataSupplier.pipe(map((value) => !!value)));

  accountAuthorities$ = combineLatest([
    this.operatorsManagement$.pipe(map((operators) => operators.authorities)),
    this.verificationBody$.pipe(
      map((body) => (body ? [{ firstName: body.name, lastName: '', roleName: 'Verifier', roleCode: 'verifier' }] : [])),
    ),
    this.dataSupplier.pipe(
      map((body) =>
        body
          ? [
              {
                firstName: body.name,
                lastName: '',
                roleName: 'Data supplier',
                roleCode: 'dataSupplier',
                userId: `${body.id ?? -1}`,
              },
            ]
          : [],
      ),
    ),
  ]).pipe(map(([operators, bodies, dataSuppliers]) => operators.concat(bodies, dataSuppliers)));
  userType$ = this.authoritiesService
    .getOperatorRoleCodes(this.accountId)
    .pipe(map((res) => res.map((role) => ({ text: role.name, value: role.code }))));

  ngOnInit(): void {
    this.operatorsManagement$
      .pipe(map((operators) => operators.contactTypes))
      .pipe(takeUntil(this.destroy$))
      .subscribe((contactTypes) =>
        this.contactTypes.patchValue({
          PRIMARY: contactTypes.PRIMARY,
          SECONDARY: contactTypes.SECONDARY,
          SERVICE: contactTypes.SERVICE,
          FINANCIAL: contactTypes.FINANCIAL,
        }),
      );
    this.refresh$.next();
  }

  get usersArray(): UntypedFormArray {
    return this.usersForm.get('usersArray') as UntypedFormArray;
  }

  get contactTypes(): UntypedFormGroup {
    return this.usersForm.get('contactTypes') as UntypedFormGroup;
  }

  addUser(userType: string): void {
    this.router.navigate([`users/add`, userType], { relativeTo: this.route });
  }

  onSubmit(): void {
    if (!this.usersForm.dirty) {
      return;
    }
    if (!this.usersForm.valid) {
      this.usersForm.markAllAsTouched();
      this.feedbackBannerStore.setInvalidForm(this.usersForm);
    } else {
      this.operatorAuthoritiesService
        .updateAccountOperatorAuthorities(this.accountId, {
          accountOperatorAuthorityUpdateList: this.usersArray.controls
            .filter((users) => users.dirty)
            .map((user) => ({
              userId: user.value.userId,
              roleCode: user.value.roleCode,
              authorityStatus: user.value.authorityStatus,
            })),
          contactTypes: this.contactTypes.value,
        })
        .pipe(
          catchBadRequest(ErrorCodes.AUTHORITY1004, () =>
            this.businessErrorService.showError(savePartiallyNotFoundOperatorError(this.accountId)),
          ),
          tap(() => {
            const updatedControlsKeys = FormUtils.findDirtyControlsKeys(this.usersForm);

            if (updatedControlsKeys.length !== 0) {
              this.feedbackBannerStore.setSuccessMessages(this.createSuccessMessages(updatedControlsKeys));
              this.usersForm.markAsPristine();
            } else {
              this.feedbackBannerStore.reset();
            }
          }),
        )
        .subscribe(() => this.refresh$.next());
    }
  }

  /**
   * Creates the success messages to be passed to the notification banner.
   *
   * @private
   * @param {string[]} controlKeys the keys of the updated controls
   * @return {*}  {string[]} the success messages
   */
  private createSuccessMessages(controlKeys: string[]): string[] {
    return controlKeys.map((key) => {
      let message: string;
      if (key === 'roleCode') {
        message = 'User Type';
      } else {
        message = this.editableCols.find((col) => col.field === key).header;
      }
      return `${message} updated`;
    });
  }
}
