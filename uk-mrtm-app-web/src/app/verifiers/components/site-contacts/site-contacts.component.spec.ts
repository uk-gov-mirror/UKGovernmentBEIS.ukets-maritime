import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { throwError } from 'rxjs';

import {
  AccountContactVbInfoResponse,
  UsersAuthoritiesInfoDTO,
  VBSiteContactsService,
  VerifierAuthoritiesService,
} from '@mrtm/api';

import { ErrorCodes } from '@netz/common/error';
import { ActivatedRouteStub, asyncData, BasePage, expectBusinessErrorToBe, MockType } from '@netz/common/testing';

import { savePartiallyNotFoundSiteContactError } from '@verifiers//errors/business-error';
import { SiteContactsComponent } from '@verifiers/components/site-contacts/site-contacts.component';
import { Mocked } from 'vitest';

describe('SiteContactsComponent', () => {
  let component: SiteContactsComponent;
  let fixture: ComponentFixture<SiteContactsComponent>;
  let page: Page;
  let activatedRoute: ActivatedRouteStub;

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

    get currentPage() {
      return this.query<HTMLLIElement>('.hmcts-pagination__item--active');
    }

    get saveButton() {
      return this.query<HTMLButtonElement>('button[type="submit"]');
    }

    get errorList() {
      return this.queryAll<HTMLLIElement>('.govuk-error-summary__list li');
    }
  }

  const verifiers: UsersAuthoritiesInfoDTO = {
    authorities: [
      {
        userId: 'ax6asd',
        authorityCreationDate: '2021-02-16T14:03:01.000Z',
        authorityStatus: 'ACTIVE',
        firstName: 'Bob',
        lastName: 'Squarepants',
      },
      {
        userId: 'bsdfg3',
        authorityCreationDate: '2021-02-16T12:03:01.000Z',
        authorityStatus: 'ACTIVE',
        firstName: 'Patrick',
        lastName: 'Star',
      },
      {
        userId: 'bGFDFG',
        authorityCreationDate: '2021-02-13T11:33:01.000Z',
        authorityStatus: 'PENDING',
        firstName: 'Tes',
        lastName: 'Locke',
      },
    ],
    editable: true,
  };
  const siteContacts: AccountContactVbInfoResponse = {
    contacts: [
      { accountName: 'Test facility', accountId: 1, type: 'Maritime', userId: verifiers.authorities[0].userId },
      { accountName: 'Dev facility', accountId: 2, type: 'Maritime' },
    ],
    editable: true,
    totalItems: 2,
  };

  const siteContactsService: Mocked<Partial<VBSiteContactsService>> = {
    getVbSiteContacts: vi.fn().mockReturnValue(asyncData(siteContacts)),
    updateVbSiteContacts: vi.fn().mockReturnValue(asyncData(null)),
  };

  const verifierAuthoritiesService: MockType<VerifierAuthoritiesService> = {
    getVerifierAuthorities: vi.fn().mockReturnValue(asyncData(verifiers)),
  };

  beforeEach(async () => {
    activatedRoute = new ActivatedRouteStub();

    await TestBed.configureTestingModule({
      imports: [SiteContactsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: VBSiteContactsService, useValue: siteContactsService },
        { provide: VerifierAuthoritiesService, useValue: verifierAuthoritiesService },
      ],
    }).compileComponents();
  });

  const createComponent = async () => {
    fixture = TestBed.createComponent(SiteContactsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  };

  beforeEach(createComponent);

  afterEach(() => vi.clearAllMocks());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have called data services only if tab is active', () => {
    expect(siteContactsService.getVbSiteContacts).not.toHaveBeenCalled();

    activatedRoute.setFragment('site-contacts');

    expect(siteContactsService.getVbSiteContacts).toHaveBeenCalledTimes(1);
    expect(siteContactsService.getVbSiteContacts).toHaveBeenCalledWith(0, 50);
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

    expect(siteContactsService.updateVbSiteContacts).toHaveBeenCalledWith([
      { accountId: 2, userId: 'bsdfg3' },
      { accountId: 1, userId: null },
    ]);
  });

  it('should show error page in case the authority has been deleted meanwhile', async () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    siteContactsService.updateVbSiteContacts.mockReturnValue(
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
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    siteContactsService.updateVbSiteContacts.mockReturnValue(
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
    siteContactsService.getVbSiteContacts.mockReturnValueOnce(asyncData({ ...siteContacts, editable: false }) as any);
    activatedRoute.setFragment('site-contacts');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.assignees.map((assignee) => assignee.textContent?.trim())).toEqual(['Unassigned', 'Bob Squarepants']);
  });

  it('should display only active verifiers', async () => {
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
