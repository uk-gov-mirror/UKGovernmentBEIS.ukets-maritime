import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { MaritimeAccountsService } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { PageHeadingComponent } from '@netz/common/components';
import { BusinessErrorComponent } from '@netz/common/error';
import { ActivatedRouteStub, BasePage, mockClass } from '@netz/common/testing';

import { AccountsListComponent } from '@accounts/containers/accounts-list';
import { OperatorAccountsStore } from '@accounts/store';
import { mockMrtmAccountResults, operatorUserRole, regulatorUserRole } from '@accounts/testing/accounts-data.mock';

import { AccountsPageComponent } from '.';

describe('AccountsPageComponent', () => {
  let component: AccountsPageComponent;
  let fixture: ComponentFixture<AccountsPageComponent>;
  let page: Page;
  let authStore: AuthStore;
  const maritimeAccountsService = mockClass(MaritimeAccountsService);

  class Page extends BasePage<AccountsPageComponent> {
    get heading() {
      return this.query<HTMLElement>('netz-page-heading');
    }

    set termValue(value: string) {
      this.setInputValue('#term', value);
    }
    get termErrorMessage() {
      return this.query<HTMLElement>('div[formcontrolname="term"] span.govuk-error-message');
    }

    get submitButton() {
      return this.query<HTMLButtonElement>('button[type="submit"]');
    }

    get accounts() {
      return this.queryAll<HTMLLIElement>('form#search-form ul.govuk-list > li');
    }

    get accountNames() {
      return this.queryAll<HTMLLIElement>('#accounts-list table>tbody>tr>td a');
    }

    get accountStatuses() {
      return this.queryAll<HTMLSpanElement>('govuk-tag');
    }
  }

  const createComponent = async () => {
    fixture = TestBed.createComponent(AccountsPageComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    vi.clearAllMocks();
  };

  const createModule = async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, AccountsPageComponent, AccountsListComponent, PageHeadingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OperatorAccountsStore,
        provideRouter([{ path: 'error/business', component: BusinessErrorComponent }]),
        { provide: MaritimeAccountsService, useValue: maritimeAccountsService },
      ],
    }).compileComponents();

    authStore = TestBed.inject(AuthStore);
  };

  describe('for operators', () => {
    beforeEach(async () => {
      maritimeAccountsService.searchCurrentUserMrtmAccounts = vi.fn().mockReturnValue(of(mockMrtmAccountResults));
    });

    beforeEach(createModule);
    beforeEach(createComponent);

    beforeEach(async () => {
      authStore.setUserState(operatorUserRole);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render the heading', async () => {
      expect(page.heading.textContent.trim()).toEqual('Accounts');
    });

    it('should show results upon loading the page', () => {
      expect(page.accountNames.map((accountName) => accountName.textContent.trim())).toEqual([
        'account1',
        'account2',
        'account3',
      ]);
    });

    it('should show error when term less than 3 characters and pressing search button', async () => {
      page.termValue = 'te';
      page.submitButton.click();
      fixture.detectChanges();
      expect(page.termErrorMessage.textContent.trim()).toContain('Enter at least 3 characters');
    });

    it('should show accounts when term filled and pressing search button', async () => {
      page.termValue = 'term';
      page.submitButton.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(page.termErrorMessage).toBeNull();
      expect(maritimeAccountsService.searchCurrentUserMrtmAccounts).toHaveBeenCalledTimes(2);
      expect(maritimeAccountsService.searchCurrentUserMrtmAccounts).toHaveBeenLastCalledWith({
        contactEmail: undefined,
        direction: undefined,
        page: 0,
        size: 20,
        sortBy: undefined,
        statuses: undefined,
        term: 'term',
      });
      expect(page.accountNames.map((accountName) => accountName.textContent.trim())).toEqual([
        'account1',
        'account2',
        'account3',
      ]);
      expect(page.accountStatuses.map((accountStatus) => accountStatus.textContent.trim())).toEqual([
        'New',
        'New',
        'New',
      ]);
    });
  });

  describe('for non operator users', () => {
    beforeEach(() => {
      maritimeAccountsService.searchCurrentUserMrtmAccounts = vi.fn().mockReturnValue(of(mockMrtmAccountResults));
    });
    beforeEach(createModule);
    beforeEach(createComponent);

    beforeEach(async () => {
      authStore.setUserState(regulatorUserRole);
      fixture.detectChanges();
    });

    it('should create', async () => {
      expect(component).toBeTruthy();
    });

    it('should render the heading', async () => {
      expect(page.heading.textContent.trim()).toEqual('Accounts');
    });

    it('should show accounts when term filled and pressing search button', async () => {
      page.termValue = 'term';
      page.submitButton.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(page.termErrorMessage).toBeNull();
      expect(maritimeAccountsService.searchCurrentUserMrtmAccounts).toHaveBeenCalledTimes(2);
      expect(maritimeAccountsService.searchCurrentUserMrtmAccounts).toHaveBeenLastCalledWith({
        contactEmail: undefined,
        direction: undefined,
        page: 0,
        size: 20,
        sortBy: undefined,
        statuses: undefined,
        term: 'term',
      });
      expect(page.accountNames.map((accountName) => accountName.textContent.trim())).toEqual([
        'account1',
        'account2',
        'account3',
      ]);
      expect(page.accountStatuses.map((accountStatus) => accountStatus.textContent.trim())).toEqual([
        'New',
        'New',
        'New',
      ]);
    });
  });

  describe('for regulators with search params set', () => {
    const activatedRouteStub = new ActivatedRouteStub(
      undefined,
      {
        term: 'account',
      },
      undefined,
    );

    beforeEach(async () => {
      maritimeAccountsService.searchCurrentUserMrtmAccounts = vi.fn().mockReturnValue(of(mockMrtmAccountResults));
    });
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, AccountsPageComponent, AccountsListComponent, PageHeadingComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          OperatorAccountsStore,
          { provide: ActivatedRoute, useValue: activatedRouteStub },
          { provide: MaritimeAccountsService, useValue: maritimeAccountsService },
        ],
      }).compileComponents();

      authStore = TestBed.inject(AuthStore);
    });
    beforeEach(createComponent);
    beforeEach(async () => {
      authStore.setUserState(regulatorUserRole);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load the accounts based on the query params', () => {
      expect(page.accountNames.map((accountName) => accountName.textContent.trim())).toEqual([
        'account1',
        'account2',
        'account3',
      ]);
      expect(page.accountStatuses.map((accountStatus) => accountStatus.textContent.trim())).toEqual([
        'New',
        'New',
        'New',
      ]);
    });
  });

  describe('for verifier users without accounts appointed to verification body', () => {
    beforeEach(async () => {
      maritimeAccountsService.searchCurrentUserMrtmAccounts = vi.fn().mockReturnValue(of({ accounts: [], total: 0 }));
    });
    beforeEach(createModule);
    beforeEach(() => {
      authStore.setUserState({
        ...authStore.state,
        status: 'ENABLED',
        roleType: 'VERIFIER',
        userId: '1',
      });
    });
    beforeEach(async () => {
      await createComponent();
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
});
