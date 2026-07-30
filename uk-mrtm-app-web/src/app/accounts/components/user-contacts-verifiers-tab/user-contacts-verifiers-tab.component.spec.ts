import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { of, throwError } from 'rxjs';

import {
  AccountThirdPartyDataProvidersService,
  AccountVerificationBodyService,
  AuthoritiesService,
  OperatorAuthoritiesService,
  UserStateDTO,
} from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { ErrorCodes } from '@netz/common/error';
import { DestroySubject } from '@netz/common/services';
import {
  ActivatedRouteStub,
  asyncData,
  BasePage,
  changeInputValue,
  expectBusinessErrorToBe,
  MockType,
} from '@netz/common/testing';

import { UserContactsVerifiersTabComponent } from '@accounts/components';
import { savePartiallyNotFoundOperatorError } from '@accounts/errors';
import { OperatorAccountsStore } from '@accounts/store';
import {
  mockedAccount,
  mockedClosedAccount,
  mockOperatorListData,
  mockOperatorRoleCodes,
} from '@accounts/testing/accounts-data.mock';
import { AuthService } from '@core/services/auth.service';

describe('UserContactsVerifiersTabComponent', () => {
  let component: UserContactsVerifiersTabComponent;
  let fixture: ComponentFixture<UserContactsVerifiersTabComponent>;
  let store: OperatorAccountsStore;
  let page: Page;
  let router: Router;
  let accountVerificationBodyService: MockType<AccountVerificationBodyService>;
  let accountThirdPartyDataProvidersService: MockType<AccountThirdPartyDataProvidersService>;
  let authStore: AuthStore;
  let authService: MockType<AuthService>;

  let activatedRouteStub: ActivatedRouteStub;

  class Page extends BasePage<UserContactsVerifiersTabComponent> {
    get addUserFormButton() {
      return this.query<HTMLButtonElement>('form[id="add-user-form"] button[type="submit"]');
    }

    get registerUserButton() {
      return this.query<HTMLButtonElement>('button[id="reg-add-user"][type="button"]');
    }

    get usersForm() {
      return this.query<HTMLFormElement>('form[id="users-form"]');
    }

    get usersFormSubmitButton() {
      return this.usersForm.querySelector<HTMLButtonElement>('button[type="submit"]');
    }

    get nameSortingButton() {
      return this.usersForm.querySelector<HTMLButtonElement>('thead button');
    }

    get rows() {
      return Array.from(this.usersForm.querySelectorAll<HTMLTableRowElement>('tbody tr'));
    }

    get nameColumns() {
      return this.rows.map((row) => row.querySelector('td'));
    }

    get nameLinks() {
      return this.nameColumns.map((name) => name.querySelector('a'));
    }

    get roleSelects() {
      return this.queryAll<HTMLSelectElement>('select[name$=".roleCode"]');
    }

    get roleSelectsValue() {
      return this.roleSelects.map((select) => this.getInputValue(`#${select.id}`));
    }

    set roleSelectsValue(value: string[]) {
      this.roleSelects.forEach((select, index) => {
        if (value[index] !== undefined) {
          this.setInputValue(`#${select.id}`, value[index]);
        }
      });
    }

    get accountStatusSelects() {
      return this.queryAll<HTMLSelectElement>('select[name$=".authorityStatus"]');
    }

    get accountStatusSelectsValue() {
      return this.accountStatusSelects.map((select) => this.getInputValue(`#${select.id}`));
    }

    set accountStatusSelectsValue(value: string[]) {
      this.accountStatusSelects.forEach((select, index) => {
        if (value[index] !== undefined) {
          this.setInputValue(`#${select.id}`, value[index]);
        }
      });
    }

    get contactRadios() {
      return this.rows.map((row) => row.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    }

    get locks() {
      return this.queryAll<HTMLDivElement>('.locked');
    }

    get appointVerifierLink() {
      return this.query<HTMLAnchorElement>('form > div > a#appointToVerifier');
    }

    get appointDataSupplierLink() {
      return this.query<HTMLAnchorElement>('form > div > a#appointToDataSupplier');
    }

    get details() {
      return this.query<HTMLDetailsElement>('govuk-details');
    }
  }

  const operatorAuthoritiesService: MockType<OperatorAuthoritiesService> = {
    updateAccountOperatorAuthorities: vi.fn().mockReturnValue(of(null)),
    deleteAccountOperatorAuthority: vi.fn().mockReturnValue(of(null)),
    deleteCurrentUserAccountOperatorAuthority: vi.fn().mockReturnValue(of(null)),
    getAccountOperatorAuthorities: vi.fn().mockReturnValue(of(mockOperatorListData)),
  };

  const authoritiesService: MockType<AuthoritiesService> = {
    getOperatorRoleCodes: vi.fn().mockReturnValue(asyncData(mockOperatorRoleCodes)),
  };

  const setUser = (roleType: UserStateDTO['roleType']) => {
    authStore.setUserState({
      ...authStore.state.userState,
      userId: 'opTestId',
      roleType,
    });
  };
  const expectUserOrderToBe = (indexes: number[]) =>
    expect(page.nameColumns.map((name) => name.textContent.trim())).toEqual(
      indexes.map(
        (index) =>
          `${mockOperatorListData.authorities[index].firstName} ${mockOperatorListData.authorities[index].lastName}`,
      ),
    );

  const createComponent = () => {
    fixture = TestBed.createComponent(UserContactsVerifiersTabComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(OperatorAccountsStore);
    store.setCurrentAccount(mockedAccount);

    page = new Page(fixture);
    fixture.detectChanges();
  };

  const createModule = async () => {
    accountVerificationBodyService = {
      getVerificationBodyOfAccount: vi.fn().mockReturnValue(throwError(() => ({ status: 404 }))),
    };
    accountThirdPartyDataProvidersService = {
      getAllThirdPartyDataProviders1: vi.fn().mockReturnValue(of(null)),
      getThirdPartyDataProviderOfAccount: vi.fn().mockReturnValue(of(null)),
    };
    activatedRouteStub = new ActivatedRouteStub({ accountId: mockedAccount.account.id });
    authService = {
      loadUserState: vi.fn(),
    };

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OperatorAccountsStore,
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: AuthService, useValue: authService },
        { provide: AuthoritiesService, useValue: authoritiesService },
        { provide: OperatorAuthoritiesService, useValue: operatorAuthoritiesService },
        { provide: AccountVerificationBodyService, useValue: accountVerificationBodyService },
        { provide: AccountThirdPartyDataProvidersService, useValue: accountThirdPartyDataProvidersService },
        { provide: DestroySubject },
      ],
    }).compileComponents();

    authStore = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
    setUser('OPERATOR');
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('for approved accounts and users with edit rights', () => {
    beforeEach(async () => {
      operatorAuthoritiesService.getAccountOperatorAuthorities = vi.fn().mockReturnValue(of(mockOperatorListData));
      await createModule();
      createComponent();
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render the title', () => {
      const element: HTMLElement = fixture.nativeElement;
      const header = element.querySelector('h2.govuk-heading-m');

      expect(header).toBeTruthy();
      expect(header.innerHTML.trim()).toEqual('Users, contacts and verifiers');
    });

    it('should display the appropriate add user buttons based on logged in user role', () => {
      setUser('REGULATOR');
      fixture.detectChanges();

      expect(page.addUserFormButton).toBeFalsy();
      expect(page.registerUserButton).toBeTruthy();
      expect(page.registerUserButton.innerHTML.trim()).toEqual('Add new operator admin');

      setUser('OPERATOR');
      fixture.detectChanges();

      expect(page.registerUserButton).toBeFalsy();
      expect(page.addUserFormButton).toBeTruthy();
      expect(page.addUserFormButton.innerHTML.trim()).toEqual('Continue');
    });

    it('should render a learn more section to operators', () => {
      setUser('REGULATOR');
      fixture.detectChanges();
      expect(page.details).toBeFalsy();

      setUser('OPERATOR');
      fixture.detectChanges();
      expect(page.details).toBeTruthy();
    });

    it('should initialize with default sorting by created date', () => {
      expectUserOrderToBe([0, 2, 1, 3]);
    });

    it('should sort by name', () => {
      page.nameSortingButton.click();
      fixture.detectChanges();

      expectUserOrderToBe([3, 2, 0, 1]);

      page.nameSortingButton.click();
      fixture.detectChanges();

      expectUserOrderToBe([1, 0, 2, 3]);
    });

    it('should render a save changes to both operator and regulator users', () => {
      setUser('REGULATOR');
      fixture.detectChanges();

      expect(page.usersFormSubmitButton).toBeTruthy();
      expect(page.usersFormSubmitButton.innerHTML.trim()).toEqual('Save');

      setUser('OPERATOR');
      fixture.detectChanges();

      expect(page.usersFormSubmitButton).toBeTruthy();
      expect(page.usersFormSubmitButton.innerHTML.trim()).toEqual('Save');
    });

    it('should render the list of users with links to both operator and regulator users', () => {
      setUser('REGULATOR');
      fixture.detectChanges();

      expect(page.nameLinks[0]).toBeTruthy();
      expect(page.nameLinks[1]).toBeTruthy();
      expect(page.nameLinks[2]).toBeTruthy();
      expect(page.nameLinks[3]).toBeTruthy();
      expect(page.roleSelectsValue[0]).toEqual('operator_admin');

      setUser('OPERATOR');
      fixture.detectChanges();

      expect(page.nameLinks[0]).toBeTruthy();
      expect(page.nameLinks[1]).toBeTruthy();
      expect(page.nameLinks[2]).toBeTruthy();
      expect(page.nameLinks[3]).toBeTruthy();
      expect(page.roleSelectsValue[0]).toEqual('operator_admin');
    });

    it('should not accept submission without at least one active operator admin', () => {
      page.roleSelectsValue = ['operator'];
      fixture.detectChanges();

      page.usersFormSubmitButton.click();
      fixture.detectChanges();

      expect(component.usersForm.invalid).toBeTruthy();
      expect(component.usersForm.touched).toBeTruthy();

      page.roleSelectsValue = [undefined, undefined, 'operator_admin'];
      page.usersFormSubmitButton.click();
      fixture.detectChanges();

      expect(component.usersForm.valid).toBeTruthy();
      expect(component.usersForm.pristine).toBeTruthy();
    });

    it('should not accept submission with the same primary and secondary contact', () => {
      page.contactRadios[2][0].click();
      page.contactRadios[2][1].click();
      fixture.detectChanges();

      page.usersFormSubmitButton.click();
      fixture.detectChanges();

      expect(component.usersForm.invalid).toBeTruthy();
      expect(component.usersForm.touched).toBeTruthy();
      expect(component.usersForm.errors).toEqual({
        samePrimarySecondary: 'You cannot assign the same user as a primary and secondary contact on your account',
      });

      page.contactRadios[3][1].click();
      page.usersFormSubmitButton.click();
      fixture.detectChanges();

      expect(component.usersForm.valid).toBeTruthy();
      expect(component.usersForm.pristine).toBeTruthy();
    });

    it('should not accept submission without at least one active primary, service and financial contact', () => {
      page.accountStatusSelectsValue = ['DISABLED'];
      fixture.detectChanges();

      page.usersFormSubmitButton.click();
      fixture.detectChanges();

      expect(component.usersForm.invalid).toBeTruthy();
      expect(component.usersForm.touched).toBeTruthy();
      expect(component.usersForm.errors).toEqual({
        noActiveOperatorAdmin: 'The account must have at least one operator admin user',
        primaryNotActive: 'You must have a primary contact on your account on a user with ACTIVE status',
      });

      page.accountStatusSelectsValue = ['ACTIVE', undefined, 'DISABLED'];
      page.usersFormSubmitButton.click();
      fixture.detectChanges();

      expect(component.usersForm.errors).toEqual({
        secondaryNotActive: 'You must have a secondary contact on your account on a user with ACTIVE status',
        serviceNotActive: 'You must have a service contact on your account on a user with ACTIVE status',
      });

      page.accountStatusSelectsValue = [undefined, undefined, 'ACTIVE', 'DISABLED'];
      page.usersFormSubmitButton.click();
      fixture.detectChanges();

      expect(component.usersForm.errors).toEqual({
        financialNotActive: 'You must have a financial contact on your account on a user with ACTIVE status',
      });

      page.accountStatusSelectsValue = [undefined, undefined, undefined, 'ACTIVE'];
      page.usersFormSubmitButton.click();
      fixture.detectChanges();

      expect(component.usersForm.valid).toBeTruthy();
      expect(component.usersForm.pristine).toBeTruthy();
    });

    it('should display correct dropdown values in users table', () => {
      expect(Array.from(page.roleSelects[0].options).map((option) => option.textContent.trim())).toEqual(
        mockOperatorRoleCodes.slice(0, 2).map((opCode) => opCode.name),
      );
    });

    it('should only allow role edit on operator and operator admins', () => {
      expect(page.roleSelects[0]).toBeTruthy();
      expect(page.rows[1].querySelector('select[name$=".roleCode"]')).toBeFalsy();
      expect(page.rows[1].querySelectorAll('td')[1].textContent.trim()).toEqual(
        mockOperatorListData.authorities[2].roleName,
      );
    });

    it('should show appoint to data supplier if one is not already appointed', async () => {
      expect(page.appointDataSupplierLink).toBeTruthy();

      accountThirdPartyDataProvidersService.getThirdPartyDataProviderOfAccount = vi.fn().mockReturnValue(
        of({
          id: 1,
          name: 'Data supplier',
        }),
      );
      activatedRouteStub.setParamMap({ accountId: 2 });

      createComponent();

      expect(page.appointDataSupplierLink).toBeFalsy();
    });

    it('should show appoint verifier button if one is not already appointed', async () => {
      expect(page.appointVerifierLink).toBeTruthy();

      accountVerificationBodyService.getVerificationBodyOfAccount = vi.fn().mockReturnValue(
        of({
          id: 1,
          name: 'Verifying company',
        }),
      );
      activatedRouteStub.setParamMap({ accountId: 2 });

      createComponent();

      expect(page.appointVerifierLink).toBeFalsy();
    });

    it('should NOT show appoint verifier button if status is CLOSED', () => {
      store.setCurrentAccount(mockedClosedAccount);
      fixture.detectChanges();

      expect(page.appointVerifierLink).toBeFalsy();
    });

    it('should navigate to add operator form', () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      page.addUserFormButton.click();
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['users/add', 'operator'], {
        relativeTo: TestBed.inject(ActivatedRoute),
      });
    });

    it('should disable the inputs of a disabled record', () => {
      expect(page.nameColumns[1].textContent.trim()).toEqual('Darth Vader');
      expect(page.rows[1].querySelector('select[name$=".roleCode"]')).toBeFalsy();
      page.contactRadios[1].forEach((radio) => expect(radio.disabled).toBeTruthy());
      page.contactRadios[0].forEach((radio) => expect(radio.disabled).toBeFalsy());

      page.accountStatusSelectsValue = [undefined, 'ACTIVE'];
      fixture.detectChanges();

      expect(page.roleSelects[1]).toBeTruthy();
    });

    it('should keep the changed values and form status after sort', () => {
      expect(page.nameColumns[1].textContent.trim()).toEqual('Darth Vader');

      page.accountStatusSelectsValue = [undefined, 'ACTIVE'];
      fixture.detectChanges();
      expect(page.accountStatusSelectsValue[1]).toEqual('ACTIVE');

      page.nameSortingButton.click();
      fixture.detectChanges();

      expect(page.nameColumns[1].textContent.trim()).toEqual('Darth Vader');
      expect(page.accountStatusSelectsValue[1]).toEqual('ACTIVE');

      page.nameSortingButton.click();
      fixture.detectChanges();

      expect(page.nameColumns[2].textContent.trim()).toEqual('Darth Vader');
      expect(page.accountStatusSelectsValue[2]).toEqual('ACTIVE');
    });

    it('should post only changed values on save', () => {
      changeInputValue(fixture, '#usersArray\\.3\\.roleCode', 'operator_admin');
      fixture.detectChanges();

      page.usersFormSubmitButton.click();
      fixture.detectChanges();

      expect(operatorAuthoritiesService.updateAccountOperatorAuthorities).toHaveBeenCalledWith(
        mockedAccount.account.id,
        {
          accountOperatorAuthorityUpdateList: [
            { authorityStatus: 'ACTIVE', roleCode: 'operator_admin', userId: 'userTest4' },
          ],
          contactTypes: mockOperatorListData.contactTypes,
        },
      );
    });

    it('should post only changed values on save after sort', () => {
      changeInputValue(fixture, '#usersArray\\.3\\.roleCode', 'operator_admin');
      fixture.detectChanges();

      page.nameSortingButton.click();
      fixture.detectChanges();

      page.usersFormSubmitButton.click();
      fixture.detectChanges();

      expect(operatorAuthoritiesService.updateAccountOperatorAuthorities).toHaveBeenCalledWith(
        mockedAccount.account.id,
        {
          accountOperatorAuthorityUpdateList: [
            { authorityStatus: 'ACTIVE', roleCode: 'operator_admin', userId: 'userTest4' },
          ],
          contactTypes: mockOperatorListData.contactTypes,
        },
      );
    });

    it('should show error summary when updating a deleted user', async () => {
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
      operatorAuthoritiesService.updateAccountOperatorAuthorities.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 400, error: { code: ErrorCodes.AUTHORITY1004 } })),
      );

      changeInputValue(fixture, '#usersArray\\.3\\.roleCode', 'operator_admin');
      fixture.detectChanges();

      page.usersFormSubmitButton.click();
      fixture.detectChanges();

      await expectBusinessErrorToBe(savePartiallyNotFoundOperatorError(mockedAccount.account.id));
    });

    it('should not display the appoint verifier link to non operator admins', () => {
      setUser('REGULATOR');
      fixture.detectChanges();

      expect(page.appointVerifierLink).toBeFalsy();
    });
  });

  describe('for approved accounts and users without edit rights', () => {
    beforeEach(async () => {
      const mockOperatorListDataNonEditable = { ...mockOperatorListData, editable: false };
      operatorAuthoritiesService.getAccountOperatorAuthorities = vi
        .fn()
        .mockReturnValueOnce(of(mockOperatorListDataNonEditable)) as any;
    });
    beforeEach(createModule);
    beforeEach(createComponent);

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should not display add user buttons', () => {
      setUser('REGULATOR');
      fixture.detectChanges();

      expect(page.addUserFormButton).toBeFalsy();
      expect(page.registerUserButton).toBeFalsy();

      setUser('OPERATOR');
      fixture.detectChanges();

      expect(page.registerUserButton).toBeFalsy();
      expect(page.addUserFormButton).toBeFalsy();
    });

    it('should not show locked status sign', () => {
      setUser('REGULATOR');
      fixture.detectChanges();
      page.locks.forEach((lock) => expect(lock).toBeFalsy());

      setUser('OPERATOR');
      fixture.detectChanges();
      page.locks.forEach((lock) => expect(lock).toBeFalsy());
    });

    it('should not render save changes button', () => {
      setUser('REGULATOR');
      fixture.detectChanges();

      expect(page.usersFormSubmitButton).toBeFalsy();

      setUser('OPERATOR');
      fixture.detectChanges();

      expect(page.usersFormSubmitButton).toBeFalsy();
    });

    it('should render the list of users sorted but without links', () => {
      setUser('REGULATOR');
      fixture.detectChanges();

      expectUserOrderToBe([0, 2, 1, 3]);
      page.nameLinks.forEach((lock) => expect(lock).toBeFalsy());

      setUser('OPERATOR');
      fixture.detectChanges();

      expectUserOrderToBe([0, 2, 1, 3]);
      page.nameLinks.forEach((lock) => expect(lock).toBeFalsy());
    });

    it('should not show appoint verifier button', () => {
      setUser('REGULATOR');
      fixture.detectChanges();
      expect(page.appointVerifierLink).toBeFalsy();

      setUser('OPERATOR');
      fixture.detectChanges();
      expect(page.appointVerifierLink).toBeFalsy();
    });

    it('should display check marks for declaring contact types', () => {
      const checkNonEditableContacts = () => {
        expect(page.rows[0].querySelectorAll('td')[2].textContent.trim()).toEqual('✓');
        expect(page.rows[0].querySelectorAll('td')[3].textContent.trim()).toBeFalsy();
        expect(page.rows[1].querySelectorAll('td')[3].textContent.trim()).toEqual('');
        expect(page.rows[1].querySelectorAll('td')[2].textContent.trim()).toBeFalsy();
        expect(page.roleSelects[0]).toBeFalsy();
        expect(page.roleSelects[2]).toBeFalsy();
      };

      setUser('REGULATOR');
      fixture.detectChanges();
      checkNonEditableContacts();

      setUser('OPERATOR');
      fixture.detectChanges();
      checkNonEditableContacts();
    });
  });
});
