import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { throwError } from 'rxjs';

import {
  AccountContactInfoResponse,
  CaSiteContactsService,
  MaritimeAccountsService,
  RegulatorAuthoritiesService,
  RegulatorUsersAuthoritiesInfoDTO,
} from '@mrtm/api';

import { ErrorCodes } from '@netz/common/error';
import { ActivatedRouteStub, asyncData, BasePage, expectBusinessErrorToBe, MockType } from '@netz/common/testing';

import { savePartiallyNotFoundSiteContactError } from '@regulators/errors/business-error';
import { initialSiteContactsFiltersState, SiteContactsStore } from '@regulators/site-contacts/+store';
import { SiteContactsComponent } from '@regulators/site-contacts/site-contacts.component';
import { Mocked } from 'vitest';

describe('SiteContactsComponent', () => {
  let component: SiteContactsComponent;
  let fixture: ComponentFixture<SiteContactsComponent>;
  let page: Page;
  let activatedRoute: ActivatedRouteStub;
  let router: Router;

  class Page extends BasePage<SiteContactsComponent> {
    get accounts() {
      return this.queryAll<HTMLTableCellElement>('tbody > tr > th');
    }

    get types() {
      return this.queryAll<HTMLTableCellElement>('tbody > tr > td').filter((_, index) => index % 2 === 0);
    }

    get assignees() {
      return this.queryAll<HTMLTableCellElement>('tbody > tr > td').filter((_, index) => index % 2 === 1);
    }

    get assigneeSelects() {
      return this.queryAll<HTMLSelectElement>('tbody select');
    }

    get assigneeSelectValues() {
      return this.assigneeSelects.map((select) => page.getInputValue(`#${select.id}`));
    }

    set assigneeSelectValues(values: string[]) {
      this.assigneeSelects.forEach((select, index) => this.setInputValue(`#${select.id}`, values[index]));
    }

    get saveButton() {
      return this.query<HTMLButtonElement>('.govuk-button-group button[type="submit"]');
    }
  }

  const regulators: RegulatorUsersAuthoritiesInfoDTO = {
    caUsers: [
      {
        userId: 'ax6asd',
        authorityCreationDate: '2021-02-16T14:03:01.000Z',
        authorityStatus: 'ACTIVE',
        firstName: 'Bob',
        lastName: 'Squarepants',
        jobTitle: 'Swimmer',
      },
      {
        userId: 'bsdfg3',
        authorityCreationDate: '2021-02-16T12:03:01.000Z',
        authorityStatus: 'ACTIVE',
        firstName: 'Patrick',
        lastName: 'Star',
        jobTitle: 'Funny guy',
      },
      {
        userId: 'bGFDFG',
        authorityCreationDate: '2021-02-13T11:33:01.000Z',
        authorityStatus: 'PENDING',
        firstName: 'Tes',
        lastName: 'Locke',
        jobTitle: 'Officer',
      },
    ],
    editable: true,
  };
  const siteContacts: AccountContactInfoResponse = {
    contacts: [
      { accountName: 'Test facility', accountId: 1, userId: regulators.caUsers[0].userId },
      { accountName: 'Dev facility', accountId: 2 },
    ],
    editable: true,
    totalItems: 2,
  };

  const siteContactsService: Mocked<Partial<CaSiteContactsService>> = {
    getCaSiteContacts: vi.fn().mockReturnValue(asyncData(siteContacts)),
    updateCaSiteContacts: vi.fn().mockReturnValue(asyncData(null)),
  };

  const regulatorAuthoritiesService: MockType<RegulatorAuthoritiesService> = {
    getCaRegulators: vi.fn().mockReturnValue(asyncData(regulators)),
  };

  const maritimeAccountsService: MockType<MaritimeAccountsService> = {
    getMrtmAccountsInfoByUser: vi.fn().mockReturnValue(
      asyncData([
        { id: 1, name: 'Test facility', businessId: 'B1' },
        { id: 2, name: 'Dev facility', businessId: 'B2' },
      ]),
    ),
  };

  beforeEach(async () => {
    activatedRoute = new ActivatedRouteStub();

    await TestBed.configureTestingModule({
      imports: [SiteContactsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: CaSiteContactsService, useValue: siteContactsService },
        { provide: RegulatorAuthoritiesService, useValue: regulatorAuthoritiesService },
        { provide: MaritimeAccountsService, useValue: maritimeAccountsService },
      ],
    }).compileComponents();
  });

  const createComponent = async () => {
    fixture = TestBed.createComponent(SiteContactsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  };

  beforeEach(createComponent);

  afterEach(() => vi.clearAllMocks());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have called data services only if tab is active', async () => {
    expect(siteContactsService.getCaSiteContacts).not.toHaveBeenCalled();

    activatedRoute.setFragment('site-contacts');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(siteContactsService.getCaSiteContacts).toHaveBeenCalledTimes(1);
    expect(siteContactsService.getCaSiteContacts).toHaveBeenCalledWith(0, 20, {});
  });

  it('should display the list of accounts with their assignees', async () => {
    activatedRoute.setFragment('site-contacts');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.accounts.map((header) => header.textContent.trim())).toEqual(['Dev facility', 'Test facility']);
    expect(page.assigneeSelectValues).toEqual([null, 'ax6asd']);
    expect(page.assigneeSelects.map((select) => select.selectedOptions[0].textContent.trim())).toEqual([
      'Unassigned',
      'Bob Squarepants',
    ]);
  });

  it('should save the updated assignees', async () => {
    activatedRoute.setFragment('site-contacts');
    await fixture.whenStable();
    fixture.detectChanges();

    page.assigneeSelectValues = ['bsdfg3', null];
    fixture.detectChanges();

    page.saveButton.click();
    fixture.detectChanges();

    expect(siteContactsService.updateCaSiteContacts).toHaveBeenCalledWith([
      { accountId: 2, userId: 'bsdfg3' },
      { accountId: 1, userId: null },
    ]);
  });

  it('should show error page in case the authority has been deleted meanwhile', async () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    siteContactsService.updateCaSiteContacts.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: { code: ErrorCodes.AUTHORITY1003 }, status: 400 })),
    );
    activatedRoute.setFragment('site-contacts');

    await fixture.whenStable();
    fixture.detectChanges();

    page.assigneeSelectValues = ['bsdfg3', null];
    fixture.detectChanges();
    page.saveButton.click();

    fixture.detectChanges();

    await expectBusinessErrorToBe(savePartiallyNotFoundSiteContactError);
  });

  it('should show error page in case the user has been deleted meanwhile', async () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    siteContactsService.updateCaSiteContacts.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: { code: ErrorCodes.ACCOUNT1004 }, status: 400 })),
    );
    activatedRoute.setFragment('site-contacts');

    await fixture.whenStable();
    fixture.detectChanges();

    page.assigneeSelectValues = ['bsdfg3', null];
    fixture.detectChanges();
    page.saveButton.click();

    fixture.detectChanges();

    await expectBusinessErrorToBe(savePartiallyNotFoundSiteContactError);
  });

  it('should display assignees as plain text if the user does not have permissions', async () => {
    siteContactsService.getCaSiteContacts.mockReturnValueOnce(asyncData({ ...siteContacts, editable: false }) as any);
    activatedRoute.setFragment('site-contacts');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.assignees.map((assignee) => assignee.textContent?.trim())).toEqual(['Unassigned', 'Bob Squarepants']);
  });

  it('should refetch the contacts with the selected businessId and restore them on clear', async () => {
    siteContactsService.getCaSiteContacts.mockImplementation(((
      _page: number,
      _size: number,
      searchCriteria: { businessId?: string },
    ) =>
      asyncData(
        searchCriteria?.businessId === 'B1'
          ? { ...siteContacts, contacts: [siteContacts.contacts[0]], totalItems: 1 }
          : siteContacts,
      )) as any);

    activatedRoute.setFragment('site-contacts');
    await fixture.whenStable();
    fixture.detectChanges();

    TestBed.inject(SiteContactsStore).setFilters({ businessId: { data: 'B1', text: 'Test facility (ID: B1)' } });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(siteContactsService.getCaSiteContacts).toHaveBeenLastCalledWith(0, 20, { businessId: 'B1' });
    expect(page.accounts.map((header) => header.textContent.trim())).toEqual(['Test facility']);
    expect(page.assigneeSelectValues).toEqual(['ax6asd']);

    TestBed.inject(SiteContactsStore).setFilters(initialSiteContactsFiltersState);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(siteContactsService.getCaSiteContacts).toHaveBeenLastCalledWith(0, 20, {});
    expect(page.accounts.map((header) => header.textContent.trim())).toEqual(['Dev facility', 'Test facility']);
  });

  it('should save only the filtered contacts when a filter is applied', async () => {
    siteContactsService.updateCaSiteContacts.mockReturnValue(asyncData(null) as any);
    siteContactsService.getCaSiteContacts.mockImplementation(((
      _page: number,
      _size: number,
      searchCriteria: { businessId?: string },
    ) =>
      asyncData(
        searchCriteria?.businessId === 'B2'
          ? { ...siteContacts, contacts: [siteContacts.contacts[1]], totalItems: 1 }
          : siteContacts,
      )) as any);

    activatedRoute.setFragment('site-contacts');
    await fixture.whenStable();
    fixture.detectChanges();

    TestBed.inject(SiteContactsStore).setFilters({ businessId: { data: 'B2', text: 'Dev facility (ID: B2)' } });
    await fixture.whenStable();
    fixture.detectChanges();

    page.assigneeSelectValues = ['bsdfg3'];
    fixture.detectChanges();

    page.saveButton.click();
    fixture.detectChanges();

    expect(siteContactsService.updateCaSiteContacts).toHaveBeenCalledWith([{ accountId: 2, userId: 'bsdfg3' }]);
  });

  it('should display only active regulators', async () => {
    activatedRoute.setFragment('site-contacts');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(Array.from(page.assigneeSelects[0].options).map((option) => option.textContent.trim())).toEqual([
      'Unassigned',
      'Bob Squarepants',
      'Patrick Star',
    ]);
  });
});
