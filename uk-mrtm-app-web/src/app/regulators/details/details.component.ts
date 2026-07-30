import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  filter,
  first,
  map,
  Observable,
  shareReplay,
  switchMap,
  takeUntil,
} from 'rxjs';

import {
  AuthoritiesService,
  AuthorityManagePermissionDTO,
  RegulatorAuthoritiesService,
  RegulatorUserDTO,
  RegulatorUsersService,
} from '@mrtm/api';

import { AuthStore, selectUserId } from '@netz/common/auth';
import { FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { BusinessErrorService, catchBadRequest, ErrorCodes } from '@netz/common/error';
import { DestroySubject } from '@netz/common/services';
import {
  ButtonDirective,
  ErrorSummaryComponent,
  FieldsetDirective,
  GovukTableColumn,
  GovukValidators,
  LegendDirective,
  PanelComponent,
  TableComponent,
  TextInputComponent,
} from '@netz/govuk-components';

import { saveNotFoundRegulatorError } from '@regulators/errors/business-error';
import {
  FileInputComponent,
  FileValidators,
  RadioOptionComponent,
  requiredFileValidator,
  TwoFaLinkComponent,
} from '@shared/components';
import { FileType } from '@shared/constants';
import { IncludesPipe, SubmitIfEmptyPipe } from '@shared/pipes';
import { UuidFilePair } from '@shared/types';
import { isNil } from '@shared/utils';

interface RegulatorTableRow {
  permission: string;
  task: string;
  type: string;
}

@Component({
  selector: 'mrtm-details',
  imports: [
    ErrorSummaryComponent,
    PageHeadingComponent,
    ReactiveFormsModule,
    FieldsetDirective,
    LegendDirective,
    TextInputComponent,
    ButtonDirective,
    TableComponent,
    PendingButtonDirective,
    PanelComponent,
    AsyncPipe,
    IncludesPipe,
    FileInputComponent,
    RadioOptionComponent,
    TwoFaLinkComponent,
    SubmitIfEmptyPipe,
  ],
  standalone: true,
  templateUrl: './details.component.html',
  providers: [DestroySubject],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authStore = inject(AuthStore);
  private readonly authoritiesService = inject(AuthoritiesService);
  private readonly router = inject(Router);
  private readonly regulatorAuthoritiesService = inject(RegulatorAuthoritiesService);
  private readonly regulatorUsersService = inject(RegulatorUsersService);
  private readonly destroy$ = inject(DestroySubject);
  private readonly businessErrorService = inject(BusinessErrorService);
  private readonly feedbackBannerStore: FeedbackBannerStore = inject(FeedbackBannerStore);

  basePermissionSelected: string;
  userFullName: string;

  isSummaryDisplayed$ = new BehaviorSubject<boolean>(false);
  confirmedAddedRegulator$ = new BehaviorSubject<string>(null);
  allowEditPermissions$: Observable<boolean>;
  userPermissions$: Observable<AuthorityManagePermissionDTO['permissions']>;
  userId$ = this.activatedRoute.paramMap.pipe(map((parameters) => parameters.get('userId')));
  isLoggedUser$ = combineLatest([this.authStore.rxSelect(selectUserId), this.userId$]).pipe(
    map(([loggedInUserId, userId]) => loggedInUserId === userId),
  );
  isInviteUserMode = !this.activatedRoute.snapshot.paramMap.has('userId');

  userRolePermissions$ = this.authoritiesService
    .getRegulatorRoles()
    .pipe(takeUntil(this.destroy$), shareReplay({ bufferSize: 1, refCount: false }));

  permissionGroups$ = this.regulatorAuthoritiesService
    .getRegulatorPermissionGroupLevels()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  form = this.fb.group({
    user: this.fb.group({
      firstName: [
        null,
        [
          GovukValidators.required(`Enter user's first name`),
          GovukValidators.maxLength(255, 'First name should not be more than 255 characters'),
        ],
      ],
      lastName: [
        null,
        [
          GovukValidators.required(`Enter user's last name`),
          GovukValidators.maxLength(255, 'Last name should not be more than 255 characters'),
        ],
      ],
      phoneNumber: [
        null,
        [
          GovukValidators.empty(`Enter user's phone number`),
          GovukValidators.maxLength(255, 'Phone number should not be more than 255 characters'),
        ],
      ],
      mobileNumber: [null, GovukValidators.maxLength(255, 'Mobile number should not be more than 255 characters')],
      email: [
        null,
        [
          GovukValidators.required(`Enter user's email`),
          GovukValidators.maxLength(255, 'Email should not be more than 255 characters'),
          GovukValidators.email('Enter an email address in the correct format, like name@example.com'),
        ],
      ],
      jobTitle: [
        null,
        [
          GovukValidators.required(`Enter user's job title`),
          GovukValidators.maxLength(255, 'Job title should not be more than 255 characters'),
        ],
      ],
      signature: [
        null,
        {
          validators: [
            ...(isNil(this.activatedRoute?.snapshot?.paramMap?.get('userId')) ? [requiredFileValidator()] : []),
            FileValidators.validContentTypes(FileType.BMP, 'must be BMP'),
            FileValidators.maxFileSize(0.2, 'must be smaller than 200KB'),
            FileValidators.maxImageDimensionsSize(240, 140, 'must be 240 x 140 pixels'),
            FileValidators.notEmpty(),
          ],
          updateOn: 'change',
        },
      ],
    }),
    permissions: this.fb.group({
      MANAGE_USERS_AND_CONTACTS: ['NONE'],
      MANAGE_GUIDANCE: ['NONE'],
      MANAGE_THIRD_PARTY_DATA_PROVIDERS: ['NONE'],
      ADD_OPERATOR_ADMIN: ['NONE'],
      MANAGE_VERIFICATION_BODIES: ['NONE'],
      ASSIGN_REASSIGN_TASKS: ['NONE'],
      REVIEW_EMP_APPLICATION: ['NONE'],
      PEER_REVIEW_EMP_APPLICATION: ['NONE'],
      SUBMIT_REVIEW_EMP_VARIATION: ['NONE'],
      PEER_REVIEW_EMP_VARIATION: ['NONE'],
      REVIEW_EMP_NOTIFICATION: ['NONE'],
      PEER_REVIEW_EMP_NOTIFICATION: ['NONE'],
      SUBMIT_DOE: ['NONE'],
      PEER_REVIEW_DOE: ['NONE'],
      REVIEW_AER: ['NONE'],
      REVIEW_VIR: ['NONE'],
      SUBMIT_NON_COMPLIANCE: ['NONE'],
      PEER_REVIEW_NON_COMPLIANCE: ['NONE'],
      ANNUAL_IMPROVEMENT_REPORT: ['NONE'],
      SUBMIT_EMP_BATCH_REISSUE: ['NONE'],
      ACCOUNT_CLOSURE: ['NONE'],
      REVIEW_SITE_VISIT: ['NONE'],
      PEER_REVIEW_SITE_VISIT: ['NONE'],
    }),
  });

  tableColumns: GovukTableColumn[] = [
    { field: 'task', header: 'Task / Item name', isSortable: false },
    { field: 'type', header: 'Type', isSortable: false },
    { field: 'EXECUTE', header: 'Execute', isSortable: false },
    { field: 'VIEW_ONLY', header: 'View only', isSortable: false },
    { field: 'NONE', header: 'None', isSortable: false },
  ];

  tableRows: RegulatorTableRow[] = [
    {
      permission: 'MANAGE_USERS_AND_CONTACTS',
      task: 'Manage users and contacts',
      type: 'Regulator users and contacts',
    },
    {
      permission: 'MANAGE_GUIDANCE',
      task: 'Manage guidance',
      type: 'Guidance',
    },
    {
      permission: 'MANAGE_THIRD_PARTY_DATA_PROVIDERS',
      task: 'Manage data suppliers',
      type: 'Data suppliers',
    },
    {
      permission: 'ADD_OPERATOR_ADMIN',
      task: 'Add operator admin',
      type: 'Users, contacts and verifiers',
    },
    {
      permission: 'MANAGE_VERIFICATION_BODIES',
      task: 'Manage verification bodies',
      type: 'Verification body accounts',
    },
    {
      permission: 'ASSIGN_REASSIGN_TASKS',
      task: 'Assign/re-assign tasks',
      type: 'Task assignment',
    },
    {
      permission: 'REVIEW_EMP_APPLICATION',
      task: 'Review',
      type: 'Emissions plan application',
    },
    {
      permission: 'PEER_REVIEW_EMP_APPLICATION',
      task: 'Peer review',
      type: 'Emissions plan application',
    },
    {
      permission: 'SUBMIT_REVIEW_EMP_VARIATION',
      task: 'Review/Submit',
      type: 'Emissions plan variation',
    },
    {
      permission: 'PEER_REVIEW_EMP_VARIATION',
      task: 'Peer review',
      type: 'Emissions plan variation',
    },
    {
      permission: 'REVIEW_EMP_NOTIFICATION',
      task: 'Review',
      type: 'EMP Notification',
    },
    {
      permission: 'PEER_REVIEW_EMP_NOTIFICATION',
      task: 'Peer review',
      type: 'EMP Notification',
    },
    {
      permission: 'SUBMIT_DOE',
      task: 'Submit',
      type: 'DoE',
    },
    {
      permission: 'PEER_REVIEW_DOE',
      task: 'Peer review',
      type: 'DoE',
    },
    {
      permission: 'REVIEW_AER',
      task: 'Review',
      type: 'AER',
    },
    {
      permission: 'REVIEW_VIR',
      task: 'Review',
      type: 'VIR',
    },
    {
      permission: 'SUBMIT_NON_COMPLIANCE',
      task: 'Submit',
      type: 'Non-compliance',
    },
    {
      permission: 'PEER_REVIEW_NON_COMPLIANCE',
      task: 'Peer review',
      type: 'Non-compliance',
    },
    {
      permission: 'ANNUAL_IMPROVEMENT_REPORT',
      task: 'Review',
      type: 'Annual improvement report',
    },
    {
      permission: 'SUBMIT_EMP_BATCH_REISSUE',
      task: 'Submit',
      type: 'Batch variation',
    },
    {
      permission: 'ACCOUNT_CLOSURE',
      task: 'Submit',
      type: 'Close account',
    },
    {
      permission: 'REVIEW_SITE_VISIT',
      task: 'Review',
      type: 'Site visit',
    },
    {
      permission: 'PEER_REVIEW_SITE_VISIT',
      task: 'Peer review',
      type: 'Site visit',
    },
  ];

  ngOnInit(): void {
    const routeData = this.activatedRoute.data as Observable<{
      user: RegulatorUserDTO;
      permissions: AuthorityManagePermissionDTO;
    }>;
    this.allowEditPermissions$ = routeData.pipe(map(({ permissions }) => !permissions || permissions.editable));
    this.userPermissions$ = routeData.pipe(map(({ permissions }) => permissions?.permissions));
    routeData
      .pipe(
        takeUntil(this.destroy$),
        filter(({ user, permissions }) => !!user && !!permissions),
      )
      .subscribe(({ user, permissions: { permissions } }) => {
        this.form.patchValue({
          user: {
            ...user,
            signature: user?.signature?.uuid
              ? {
                  uuid: user?.signature.uuid,
                  file: { name: user.signature.name },
                }
              : null,
          },
          permissions,
        });
        this.form.get('user').get('email').disable();
        this.userFullName = user.firstName + ' ' + user.lastName;
      });
  }

  setBasePermissions(roleCode: string): void {
    this.basePermissionSelected = roleCode;
    this.userRolePermissions$.subscribe((roles) => {
      const { rolePermissions } = roles.find((role) => role.code === roleCode);
      this.form.get('permissions').patchValue(rolePermissions);
    });

    this.form.markAsDirty();
  }

  submitForm(): void {
    const signature = this.form.get('user.signature').value as UuidFilePair;
    if (this.form.valid) {
      const userEmail = this.form.get('user').get('email').value;
      const userId$ = this.userId$.pipe(first());
      if (!signature) {
        this.form.get('user.signature').setErrors({
          fileNotExist: 'Select a file',
        });

        return;
      }

      if (!this.form.dirty) {
        this.router.navigate(['../../regulators'], { relativeTo: this.activatedRoute });
        return;
      }

      const signatureBlob = signature.file?.size ? signature.file : null;

      userId$
        .pipe(
          switchMap((userId) => {
            const loggedInUserId = this.authStore.select(selectUserId)();
            if (userId) {
              const payload = { ...this.form.getRawValue() };
              return userId === loggedInUserId
                ? this.regulatorUsersService.updateCurrentRegulatorUser(payload, signatureBlob)
                : this.regulatorUsersService.updateRegulatorUserByCaAndId(userId, payload, signatureBlob);
            } else {
              const payload = { ...this.form.get('user').value, permissions: this.form.get('permissions').value };
              return this.regulatorUsersService.inviteRegulatorUserToCA(payload, signatureBlob);
            }
          }),
          catchBadRequest([ErrorCodes.USER1001, ErrorCodes.AUTHORITY1005, ErrorCodes.AUTHORITY1014], () => {
            this.form.get('user').get('email').setErrors({
              emailExists: 'This user email already exists in the service',
            });
            this.isSummaryDisplayed$.next(true);

            return EMPTY;
          }),
          catchBadRequest(ErrorCodes.AUTHORITY1003, () =>
            this.businessErrorService.showError(saveNotFoundRegulatorError),
          ),
          switchMap(() => userId$),
        )
        .subscribe((userId) => {
          if (userId) {
            this.feedbackBannerStore.setSuccessMessages(['Regulator details updated']);
            this.router.navigate(['../../regulators'], { relativeTo: this.activatedRoute });
          } else {
            this.confirmedAddedRegulator$.next(userEmail);
          }
        });
    } else {
      this.isSummaryDisplayed$.next(true);

      if (!signature) {
        this.form.get('user.signature').setErrors({
          fileNotExist: 'Select a file',
        });
      }
    }
  }

  getCurrentUserDownloadUrl(uuid: string): string | string[] {
    return ['..', 'file-download', uuid];
  }

  getDownloadUrl(uuid: string): string | string[] {
    return ['file-download', uuid];
  }
}
