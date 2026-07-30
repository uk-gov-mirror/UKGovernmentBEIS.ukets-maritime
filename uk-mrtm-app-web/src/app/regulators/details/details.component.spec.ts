import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { firstValueFrom, of, throwError } from 'rxjs';

import {
  AuthoritiesService,
  FileInfoDTO,
  RegulatorAuthoritiesService,
  RegulatorUserDTO,
  RegulatorUsersService,
} from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ErrorCodes } from '@netz/common/error';
import {
  ActivatedRouteStub,
  asyncData,
  BasePage,
  BusinessErrorStubComponent,
  expectBusinessErrorToBe,
  MockType,
} from '@netz/common/testing';

import { DetailsComponent } from '@regulators/details/details.component';
import { saveNotFoundRegulatorError } from '@regulators/errors/business-error';
import {
  mockRegulatorBasePermissions,
  mockRegulatorPermissionGroups,
  mockRegulatorRolePermissions,
  mockRegulatorUser,
  mockRegulatorUserStatus,
} from '@regulators/testing/regulators-data.mock';

describe('RegulatorDetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;
  let activatedRoute: ActivatedRouteStub;
  let authStore: AuthStore;
  let regulatorUsersService: MockType<RegulatorUsersService>;
  let authoritiesService: MockType<AuthoritiesService>;
  let regulatorAuthoritiesService: MockType<RegulatorAuthoritiesService>;
  let router: Router;
  let page: Page;

  class Page extends BasePage<DetailsComponent> {
    get firstNameValue() {
      return this.getInputValue('#user.firstName');
    }

    set firstNameValue(value: string) {
      this.setInputValue('#user.firstName', value);
    }

    get lastNameValue() {
      return this.getInputValue('#user.lastName');
    }

    set lastNameValue(value: string) {
      this.setInputValue('#user.lastName', value);
    }

    get emailValue() {
      return this.getInputValue('#user.email');
    }

    set emailValue(value: string) {
      this.setInputValue('#user.email', value);
    }

    set jobTitleValue(value: string) {
      this.setInputValue('#user.jobTitle', value);
    }

    get phoneNumberValue() {
      return this.getInputValue('#user.phoneNumber');
    }

    set phoneNumberValue(value: string) {
      this.setInputValue('#user.phoneNumber', value);
    }

    set signatureValue(value: FileInfoDTO) {
      this.setInputValue('#user.signature', new File([value.name], value.name));
    }

    get confirmationPanel() {
      return this.query<HTMLDivElement>('.govuk-panel');
    }

    get links() {
      return this.queryAll<HTMLLinkElement>('a');
    }

    get twoFaLink() {
      return this.query<HTMLLinkElement>('mrtm-two-fa-link');
    }

    get basePermissionButtonRegulatorAdmin() {
      return this.query<HTMLButtonElement>('#regulator_admin_team');
    }

    get basePermissionButtonRegulatortechnicalOfficer() {
      return this.query<HTMLButtonElement>('#regulator_technical_officer');
    }

    get basePermissionButtonRegulatorTeamLeader() {
      return this.query<HTMLButtonElement>('#regulator_team_leader');
    }

    get basePermissionButtonCASuperUser() {
      return this.query<HTMLButtonElement>('#ca_super_user');
    }

    get basePermissionButtonMrtmSuperUser() {
      return this.query<HTMLButtonElement>('#service_super_user');
    }
  }

  beforeEach(async () => {
    activatedRoute = new ActivatedRouteStub();
    regulatorUsersService = {
      inviteRegulatorUserToCA: vi.fn().mockReturnValue(asyncData(null)),
      updateCurrentRegulatorUser: vi.fn().mockReturnValue(asyncData(null)),
      updateRegulatorUserByCaAndId: vi.fn().mockReturnValue(asyncData(null)),
    };
    authoritiesService = {
      getRegulatorRoles: vi.fn().mockReturnValue(asyncData(mockRegulatorBasePermissions)),
    };
    regulatorAuthoritiesService = {
      getRegulatorPermissionGroupLevels: vi.fn().mockReturnValue(asyncData(mockRegulatorPermissionGroups)),
    };

    await TestBed.configureTestingModule({
      imports: [DetailsComponent],
      providers: [
        provideRouter([{ path: 'error/business', component: BusinessErrorStubComponent }]),
        FormBuilder,
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: AuthoritiesService, useValue: authoritiesService },
        { provide: RegulatorUsersService, useValue: regulatorUsersService },
        { provide: RegulatorAuthoritiesService, useValue: regulatorAuthoritiesService },
      ],
    }).compileComponents();

    authStore = TestBed.inject(AuthStore);
    authStore.setIsLoggedIn(true);
    authStore.setUserState(mockRegulatorUserStatus);
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    // Rendering the error summary calls `.focus()`, and jsdom schedules a `selectionchange` event
    // via `setTimeout(0)`; fake timers so that internal timer is never a real (leaking) resource.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Edit user', () => {
    beforeEach(() => {
      activatedRoute.setParamMap({ userId: '222' });
      activatedRoute.setResolveMap(mockRegulatorUser);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should change header and button text', () => {
      expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toEqual('Edit user details');
      expect(page.submitButton.textContent.trim()).toEqual('Save');
    });

    it('should prefill with data the regulator form when editing a user', async () => {
      expect(page.firstNameValue).toEqual('John');
      expect(page.lastNameValue).toEqual('Doe');
      expect(page.emailValue).toEqual('test@host.com');
      expect(page.phoneNumberValue).toEqual('23456');
      expect(component.form.get('permissions.ACCOUNT_CLOSURE').value).toEqual('EXECUTE');
      expect(component.form.get('permissions.ADD_OPERATOR_ADMIN').value).toEqual('NONE');
      expect(component.form.get('permissions.ANNUAL_IMPROVEMENT_REPORT').value).toEqual('NONE');
      expect(component.form.get('permissions.ASSIGN_REASSIGN_TASKS').value).toEqual('NONE');
      expect(component.form.get('permissions.MANAGE_USERS_AND_CONTACTS').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.MANAGE_VERIFICATION_BODIES').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.PEER_REVIEW_DOE').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_APPLICATION').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_NOTIFICATION').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_VARIATION').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.PEER_REVIEW_NON_COMPLIANCE').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.REVIEW_AER').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.REVIEW_EMP_APPLICATION').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.REVIEW_EMP_NOTIFICATION').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.REVIEW_VIR').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.SUBMIT_DOE').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.SUBMIT_NON_COMPLIANCE').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.SUBMIT_EMP_BATCH_REISSUE').value).toEqual('VIEW_ONLY');
      expect(component.form.get('permissions.SUBMIT_REVIEW_EMP_VARIATION').value).toEqual('VIEW_ONLY');
      expect(component.form.get('user.email').disabled).toBeTruthy();

      await expect(firstValueFrom(component.allowEditPermissions$)).resolves.toBeTruthy();
      await expect(firstValueFrom(component.userPermissions$)).resolves.toEqual(
        mockRegulatorUser.permissions.permissions,
      );
    });

    it('should save changes when editing current user', () => {
      authStore.setUserState({ ...mockRegulatorUserStatus, userId: '222' });
      const newFirstName = 'Mary';

      page.firstNameValue = newFirstName;
      fixture.detectChanges();

      page.submitButton.click();

      expect(regulatorUsersService.updateCurrentRegulatorUser).toHaveBeenCalledWith(
        {
          permissions: mockRegulatorUser.permissions.permissions,
          user: {
            ...mockRegulatorUser.user,
            firstName: newFirstName,
            signature: {
              uuid: mockRegulatorUser.user.signature.uuid,
              file: { name: mockRegulatorUser.user.signature.name },
            },
          },
        },
        null,
      );
    });

    it('should save changes when editing another user', () => {
      authStore.setUserState(mockRegulatorUserStatus);
      const newFirstName = 'Mary';

      page.firstNameValue = newFirstName;
      fixture.detectChanges();

      page.submitButton.click();
      fixture.detectChanges();

      expect(regulatorUsersService.updateRegulatorUserByCaAndId).toHaveBeenCalledWith(
        '222',
        {
          permissions: mockRegulatorUser.permissions.permissions,
          user: {
            ...mockRegulatorUser.user,
            firstName: newFirstName,
            signature: {
              uuid: mockRegulatorUser.user.signature.uuid,
              file: { name: mockRegulatorUser.user.signature.name },
            },
          },
        },
        null,
      );
    });

    it('should redirect to the list after save', async () => {
      const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      page.firstNameValue = 'Mary';
      fixture.detectChanges();

      page.submitButton.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(navSpy).toHaveBeenCalledTimes(1);
      expect(navSpy).toHaveBeenCalledWith(['../../regulators'], { relativeTo: activatedRoute });
      expect(page.confirmationPanel).toBeFalsy();
    });

    it('should throw an error when updating a deleted user', async () => {
      regulatorUsersService.updateRegulatorUserByCaAndId.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 400, error: { code: ErrorCodes.AUTHORITY1003 } })),
      );

      page.firstNameValue = 'Mary';
      fixture.detectChanges();

      page.submitButton.click();
      fixture.detectChanges();

      await expectBusinessErrorToBe(saveNotFoundRegulatorError);
    });

    it('should fill the form with predefined permissions when user role buttons are clicked', async () => {
      const getPermission = (name: string) =>
        mockRegulatorBasePermissions.find((permission) => permission.code === name);
      const element: HTMLElement = fixture.nativeElement;

      const buttonIds = [
        'regulator_admin_team',
        'ca_super_user',
        'regulator_team_leader',
        'regulator_admin_team',
        'service_super_user',
      ];

      for (const buttonId of buttonIds) {
        const btnElement = element.querySelector<HTMLButtonElement>('#' + buttonId);
        btnElement.click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(authoritiesService.getRegulatorRoles).toHaveBeenCalled();
        const basePermission = getPermission(buttonId);

        mockRegulatorRolePermissions.forEach((rolePermission) =>
          expect(component.form.get(`permissions.${rolePermission}`).value).toEqual(
            basePermission.rolePermissions[rolePermission],
          ),
        );
      }
    });

    it('should display the change 2fa link when editing current user', async () => {
      authStore.setUserState({ ...mockRegulatorUserStatus, userId: '222' });
      activatedRoute.setParamMap({ userId: '222' });
      await fixture.whenStable();
      const isLoggedUser = await firstValueFrom(component.isLoggedUser$);
      expect(isLoggedUser).toEqual(true);
    });

    it('should display the reset 2fa link when editing other user', async () => {
      authStore.setUserState({ ...mockRegulatorUserStatus, userId: '2' });
      activatedRoute.setParamMap({ userId: '222' });

      page.firstNameValue = 'Mary';
      fixture.detectChanges();

      await expect(firstValueFrom(component.isLoggedUser$)).resolves.toEqual(false);
      fixture.detectChanges();
      expect(page.twoFaLink.textContent.trim()).toEqual('Reset two-factor authentication');
    });
  });

  describe('View user', () => {
    beforeEach(() => {
      activatedRoute.setParamMap({ userId: '222' });
      activatedRoute.setResolveMap({
        user: mockRegulatorUser.user,
        permissions: { ...mockRegulatorUser.permissions, editable: false },
      });
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should show user in view mode when edit is not allowed', () => {
      const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector('#check-ACCOUNT_CLOSURE-EXECUTE')).toBeTruthy();
      expect(element.querySelector('#check-ADD_OPERATOR_ADMIN-NONE')).toBeTruthy();
      expect(element.querySelector('#check-ANNUAL_IMPROVEMENT_REPORT-NONE')).toBeTruthy();
      expect(element.querySelector('#check-ASSIGN_REASSIGN_TASKS-NONE')).toBeTruthy();
      expect(element.querySelector('#check-MANAGE_USERS_AND_CONTACTS-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-MANAGE_VERIFICATION_BODIES-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-PEER_REVIEW_DOE-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-PEER_REVIEW_EMP_APPLICATION-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-PEER_REVIEW_EMP_NOTIFICATION-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-PEER_REVIEW_EMP_VARIATION-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-PEER_REVIEW_NON_COMPLIANCE-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-REVIEW_AER-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-REVIEW_EMP_APPLICATION-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-REVIEW_EMP_NOTIFICATION-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-REVIEW_VIR-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-SUBMIT_DOE-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-SUBMIT_NON_COMPLIANCE-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-SUBMIT_EMP_BATCH_REISSUE-VIEW_ONLY')).toBeTruthy();
      expect(element.querySelector('#check-SUBMIT_REVIEW_EMP_VARIATION-VIEW_ONLY')).toBeTruthy();
    });

    it('should not display the 2fa link', async () => {
      authStore.setUserState({ ...mockRegulatorUserStatus, userId: '222' });
      activatedRoute.setParamMap({ userId: '222' });

      expect(page.twoFaLink).toBeFalsy();
    });
  });

  describe('Add new user', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render header and button text for add new user', () => {
      expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toEqual('Enter user details');
      expect(page.submitButton.textContent.trim()).toEqual('Submit');
      expect(fixture.nativeElement.querySelector('button[id="regulator_admin_team"]')).toBeTruthy();
    });

    it('should save a new user', async () => {
      fixture.detectChanges();

      expect(page.submitButton.disabled).toBeFalsy();

      page.firstNameValue = mockRegulatorUser.user.firstName;
      page.lastNameValue = mockRegulatorUser.user.lastName;
      page.emailValue = mockRegulatorUser.user.email;
      page.jobTitleValue = mockRegulatorUser.user.jobTitle;
      page.signatureValue = mockRegulatorUser.user.signature;

      fixture.detectChanges();

      expect(component.form.get('permissions.ACCOUNT_CLOSURE').value).toEqual('NONE');
      expect(component.form.get('permissions.ADD_OPERATOR_ADMIN').value).toEqual('NONE');
      expect(component.form.get('permissions.ANNUAL_IMPROVEMENT_REPORT').value).toEqual('NONE');
      expect(component.form.get('permissions.ASSIGN_REASSIGN_TASKS').value).toEqual('NONE');
      expect(component.form.get('permissions.MANAGE_USERS_AND_CONTACTS').value).toEqual('NONE');
      expect(component.form.get('permissions.MANAGE_VERIFICATION_BODIES').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_DOE').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_APPLICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_NOTIFICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_VARIATION').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_NON_COMPLIANCE').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_AER').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_EMP_APPLICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_EMP_NOTIFICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_VIR').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_DOE').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_NON_COMPLIANCE').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_EMP_BATCH_REISSUE').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_REVIEW_EMP_VARIATION').value).toEqual('NONE');

      page.submitButton.click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(regulatorUsersService.inviteRegulatorUserToCA).not.toHaveBeenCalled();

      page.phoneNumberValue = (mockRegulatorUser.user as RegulatorUserDTO).phoneNumber;
      page.submitButton.click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(regulatorUsersService.inviteRegulatorUserToCA).toHaveBeenCalled();
    });

    it('should show errors if email already exists', () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture.detectChanges();

      page.firstNameValue = mockRegulatorUser.user.firstName;
      page.lastNameValue = mockRegulatorUser.user.lastName;
      page.emailValue = mockRegulatorUser.user.email;
      page.jobTitleValue = mockRegulatorUser.user.jobTitle;
      page.signatureValue = mockRegulatorUser.user.signature;

      expect(component.form.get('permissions.ACCOUNT_CLOSURE').value).toEqual('NONE');
      expect(component.form.get('permissions.ADD_OPERATOR_ADMIN').value).toEqual('NONE');
      expect(component.form.get('permissions.ANNUAL_IMPROVEMENT_REPORT').value).toEqual('NONE');
      expect(component.form.get('permissions.ASSIGN_REASSIGN_TASKS').value).toEqual('NONE');
      expect(component.form.get('permissions.MANAGE_USERS_AND_CONTACTS').value).toEqual('NONE');
      expect(component.form.get('permissions.MANAGE_VERIFICATION_BODIES').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_DOE').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_APPLICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_NOTIFICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_VARIATION').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_NON_COMPLIANCE').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_AER').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_EMP_APPLICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_EMP_NOTIFICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_VIR').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_DOE').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_NON_COMPLIANCE').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_EMP_BATCH_REISSUE').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_REVIEW_EMP_VARIATION').value).toEqual('NONE');

      page.submitButton.click();
      fixture.detectChanges();
      expect(regulatorUsersService.inviteRegulatorUserToCA).not.toHaveBeenCalled();

      page.phoneNumberValue = (mockRegulatorUser.user as RegulatorUserDTO).phoneNumber;
      regulatorUsersService.inviteRegulatorUserToCA.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 400, error: { code: ErrorCodes.USER1001 } })),
      );
      page.submitButton.click();
      fixture.detectChanges();
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(component.form.valid).toBeFalsy();
      expect(page.errorSummary.textContent).toContain('This user email already exists in the service');

      page.emailValue = 'test@email.com';
      regulatorUsersService.inviteRegulatorUserToCA.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 400, error: { code: ErrorCodes.AUTHORITY1005 } })),
      );
      page.submitButton.click();
      fixture.detectChanges();
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(component.form.valid).toBeFalsy();
      expect(page.errorSummary.textContent).toContain('This user email already exists in the service');
    });

    it('should show confirmation when saving', () => {
      regulatorUsersService.inviteRegulatorUserToCA.mockReturnValueOnce(of(null));
      const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      page.firstNameValue = mockRegulatorUser.user.firstName;
      page.lastNameValue = mockRegulatorUser.user.lastName;
      page.emailValue = mockRegulatorUser.user.email;
      page.phoneNumberValue = (mockRegulatorUser.user as RegulatorUserDTO).phoneNumber;
      page.signatureValue = mockRegulatorUser.user.signature;
      page.jobTitleValue = mockRegulatorUser.user.jobTitle;

      expect(component.form.get('permissions.ACCOUNT_CLOSURE').value).toEqual('NONE');
      expect(component.form.get('permissions.ADD_OPERATOR_ADMIN').value).toEqual('NONE');
      expect(component.form.get('permissions.ANNUAL_IMPROVEMENT_REPORT').value).toEqual('NONE');
      expect(component.form.get('permissions.ASSIGN_REASSIGN_TASKS').value).toEqual('NONE');
      expect(component.form.get('permissions.MANAGE_USERS_AND_CONTACTS').value).toEqual('NONE');
      expect(component.form.get('permissions.MANAGE_VERIFICATION_BODIES').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_DOE').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_APPLICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_NOTIFICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_EMP_VARIATION').value).toEqual('NONE');
      expect(component.form.get('permissions.PEER_REVIEW_NON_COMPLIANCE').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_AER').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_EMP_APPLICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_EMP_NOTIFICATION').value).toEqual('NONE');
      expect(component.form.get('permissions.REVIEW_VIR').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_DOE').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_NON_COMPLIANCE').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_EMP_BATCH_REISSUE').value).toEqual('NONE');
      expect(component.form.get('permissions.SUBMIT_REVIEW_EMP_VARIATION').value).toEqual('NONE');

      fixture.detectChanges();
      page.submitButton.click();
      fixture.detectChanges();

      expect(regulatorUsersService.inviteRegulatorUserToCA).toHaveBeenCalledTimes(1);
      expect(page.confirmationPanel).toBeTruthy();
      expect(navSpy).not.toHaveBeenCalled();
    });

    it('should not display the 2fa link', async () => {
      authStore.setUserState({ ...mockRegulatorUserStatus, userId: '2' });
      activatedRoute.setParamMap({ userId: '222' });

      expect(page.twoFaLink).toBeFalsy();
    });

    it('should set aria-pressed attribute for the pressed base permission buttons when user role buttons are clicked', () => {
      expect(page.basePermissionButtonRegulatorAdmin.getAttribute('aria-pressed')).toEqual('false');
      expect(page.basePermissionButtonCASuperUser.getAttribute('aria-pressed')).toEqual('false');
      expect(page.basePermissionButtonMrtmSuperUser.getAttribute('aria-pressed')).toEqual('false');
      expect(page.basePermissionButtonRegulatorTeamLeader.getAttribute('aria-pressed')).toEqual('false');
      expect(page.basePermissionButtonRegulatortechnicalOfficer.getAttribute('aria-pressed')).toEqual('false');

      page.basePermissionButtonRegulatortechnicalOfficer.click();
      fixture.detectChanges();

      expect(page.basePermissionButtonRegulatorAdmin.getAttribute('aria-pressed')).toEqual('false');
      expect(page.basePermissionButtonCASuperUser.getAttribute('aria-pressed')).toEqual('false');
      expect(page.basePermissionButtonMrtmSuperUser.getAttribute('aria-pressed')).toEqual('false');
      expect(page.basePermissionButtonRegulatorTeamLeader.getAttribute('aria-pressed')).toEqual('false');
      expect(page.basePermissionButtonRegulatortechnicalOfficer.getAttribute('aria-pressed')).toEqual('true');

      page.basePermissionButtonRegulatorAdmin.click();
      fixture.detectChanges();

      expect(page.basePermissionButtonRegulatorAdmin.getAttribute('aria-pressed')).toEqual('true');
      expect(page.basePermissionButtonCASuperUser.getAttribute('aria-pressed')).toEqual('false');
      expect(page.basePermissionButtonMrtmSuperUser.getAttribute('aria-pressed')).toEqual('false');
      expect(page.basePermissionButtonRegulatorTeamLeader.getAttribute('aria-pressed')).toEqual('false');
      expect(page.basePermissionButtonRegulatortechnicalOfficer.getAttribute('aria-pressed')).toEqual('false');
    });
  });
});
