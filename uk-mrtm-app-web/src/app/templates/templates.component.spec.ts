import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { DocumentTemplatesService, NotificationTemplateSearchResults, NotificationTemplatesService } from '@mrtm/api';

import { PageHeadingComponent } from '@netz/common/components';
import { GovukDatePipe } from '@netz/common/pipes';
import { BasePage, mockClass } from '@netz/common/testing';

import { TemplatesComponent } from '@templates/templates.component';

const operatorEmails: NotificationTemplateSearchResults = {
  templates: [
    {
      id: 1,
      name: 'Permit Rejected',
      roleType: 'OPERATOR',
      workflow: 'Permit Application',
      lastUpdatedDate: '2022-01-11T13:22:58.760561Z',
    },
    {
      id: 2,
      name: 'Batch RFI',
      roleType: 'OPERATOR',
      workflow: 'Permit Application',
      lastUpdatedDate: '2022-01-12T15:22:58.760561Z',
    },
  ],
  total: 2,
};

const regulatorEmails: NotificationTemplateSearchResults = {
  templates: [
    {
      id: 3,
      name: 'Permit Accepted',
      roleType: 'REGULATOR',
      workflow: 'Permit Application',
      lastUpdatedDate: '2022-01-11T13:22:58.760561Z',
    },
    {
      id: 4,
      name: 'Account Created',
      roleType: 'REGULATOR',
      workflow: 'Organisation Account Opening',
      lastUpdatedDate: '2022-01-12T15:22:58.760561Z',
    },
  ],
  total: 2,
};

const operatorDocuments: NotificationTemplateSearchResults = {
  templates: [
    {
      id: 5,
      name: 'Permit Refused Document',
      roleType: 'OPERATOR',
      workflow: 'Permit Application',
      lastUpdatedDate: '2022-01-21T13:32:58.760561Z',
    },
  ],
  total: 1,
};

describe('TemplatesComponent', () => {
  let component: TemplatesComponent;
  let fixture: ComponentFixture<TemplatesComponent>;
  let hostElement: HTMLElement;
  let page: Page;
  const notificationTemplatesService = mockClass(NotificationTemplatesService);
  const documentTemplatesService = mockClass(DocumentTemplatesService);

  class Page extends BasePage<TemplatesComponent> {
    get regulatorEmailsTabLink() {
      return this.query<HTMLAnchorElement>('#tab_regulator-emails');
    }

    get operatorDocumentsTabLink() {
      return this.query<HTMLAnchorElement>('#tab_operator-documents');
    }

    get operatorEmailsTab() {
      return this.query<HTMLDivElement>('#operator-emails');
    }

    get regulatorEmailsTab() {
      return this.query<HTMLDivElement>('#regulator-emails');
    }

    get operatorDocumentsTab() {
      return this.query<HTMLDivElement>('#operator-documents');
    }

    set termValue(value: string) {
      this.setInputValue('#term', value);
    }

    get searchButton() {
      return this.query<HTMLButtonElement>('button[type="submit"]');
    }

    get formErrorMessage() {
      return this.query<HTMLElement>('div[formcontrolname="term"] span.govuk-error-message');
    }
  }

  const createComponent = async () => {
    fixture = TestBed.createComponent(TemplatesComponent);
    component = fixture.componentInstance;
    hostElement = fixture.nativeElement;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  const createModule = async () => {
    await TestBed.configureTestingModule({
      imports: [TemplatesComponent, GovukDatePipe, PageHeadingComponent],
      providers: [
        provideRouter([]),
        { provide: NotificationTemplatesService, useValue: notificationTemplatesService },
        { provide: DocumentTemplatesService, useValue: documentTemplatesService },
      ],
    }).compileComponents();
  };

  describe('for empty results', () => {
    beforeEach(async () => {
      notificationTemplatesService.getCurrentUserNotificationTemplates.mockReturnValue(
        of({
          templates: [],
          total: 0,
        }) as any,
      );
      documentTemplatesService.getCurrentUserDocumentTemplates.mockReturnValue(
        of({
          templates: [],
          total: 0,
        }) as any,
      );
    });

    beforeEach(createModule);
    beforeEach(createComponent);

    it('should render no results found', async () => {
      fixture.detectChanges();

      expect(hostElement.textContent).toContain('There are no results to show');

      expect(notificationTemplatesService.getCurrentUserNotificationTemplates).toHaveBeenLastCalledWith(
        0,
        30,
        ['OPERATOR'],
        null,
      );
    });
  });

  describe('for non empty results', () => {
    beforeEach(async () => {
      notificationTemplatesService.getCurrentUserNotificationTemplates.mockReturnValue(of(operatorEmails) as any);
      documentTemplatesService.getCurrentUserDocumentTemplates.mockReturnValue(of(operatorDocuments) as any);
    });
    beforeEach(createModule);
    beforeEach(createComponent);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render operator emails', async () => {
      fixture.detectChanges();
      expect(notificationTemplatesService.getCurrentUserNotificationTemplates).toHaveBeenLastCalledWith(
        0,
        30,
        ['OPERATOR'],
        null,
      );

      const tableHeaders = Array.from(page.operatorEmailsTab.querySelectorAll('th'));
      const tableData = Array.from(page.operatorEmailsTab.querySelectorAll('td'));
      expect(tableHeaders.map((header) => header.textContent.trim())).toEqual([
        'Template name',
        'Workflow',
        'Last changed',
      ]);
      expect(tableData.map((data) => data.textContent.trim())).toEqual([
        ...['Permit Rejected', 'Permit Application', '11 Jan 2022'],
        ...['Batch RFI', 'Permit Application', '12 Jan 2022'],
      ]);

      page.termValue = 'pe';
      page.searchButton.click();
      fixture.detectChanges();
      expect(page.formErrorMessage.textContent.trim()).toContain('Enter at least 3 characters');

      page.termValue = 'bat';
      page.searchButton.click();
      fixture.detectChanges();
      expect(page.formErrorMessage).toBeFalsy();

      expect(notificationTemplatesService.getCurrentUserNotificationTemplates).toHaveBeenLastCalledWith(
        0,
        30,
        ['OPERATOR'],
        'bat',
      );
    });

    it('should render regulator emails', async () => {
      notificationTemplatesService.getCurrentUserNotificationTemplates.mockReturnValue(of(regulatorEmails) as any);
      page.regulatorEmailsTabLink.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(notificationTemplatesService.getCurrentUserNotificationTemplates).toHaveBeenLastCalledWith(
        0,
        30,
        ['REGULATOR'],
        null,
      );

      const tableHeaders = Array.from(page.regulatorEmailsTab.querySelectorAll('th'));
      const tableData = Array.from(page.regulatorEmailsTab.querySelectorAll('td'));
      expect(tableHeaders.map((header) => header.textContent.trim())).toEqual([
        'Template name',
        'Workflow',
        'Last changed',
      ]);
      expect(tableData.map((data) => data.textContent.trim())).toEqual([
        ...['Permit Accepted', 'Permit Application', '11 Jan 2022'],
        ...['Account Created', 'Organisation Account Opening', '12 Jan 2022'],
      ]);

      page.termValue = 'ac';
      page.searchButton.click();
      fixture.detectChanges();
      expect(page.formErrorMessage.textContent.trim()).toContain('Enter at least 3 characters');

      page.termValue = 'acc';
      page.searchButton.click();
      fixture.detectChanges();
      expect(page.formErrorMessage).toBeFalsy();

      expect(notificationTemplatesService.getCurrentUserNotificationTemplates).toHaveBeenLastCalledWith(
        0,
        30,
        ['REGULATOR'],
        'acc',
      );
    });

    it('should render operator documents', async () => {
      page.operatorDocumentsTabLink.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(documentTemplatesService.getCurrentUserDocumentTemplates).toHaveBeenLastCalledWith(
        0,
        30,
        ['OPERATOR'],
        null,
      );

      const tableHeaders = Array.from(page.operatorDocumentsTab.querySelectorAll('th'));
      const tableData = Array.from(page.operatorDocumentsTab.querySelectorAll('td'));
      expect(tableHeaders.map((header) => header.textContent.trim())).toEqual([
        'Template name',
        'Workflow',
        'Last changed',
      ]);
      expect(tableData.map((data) => data.textContent.trim())).toEqual([
        ...['Permit Refused Document', 'Permit Application', '21 Jan 2022'],
      ]);

      page.termValue = 're';
      page.searchButton.click();
      fixture.detectChanges();
      expect(page.formErrorMessage.textContent.trim()).toContain('Enter at least 3 characters');

      page.termValue = 'ref';
      page.searchButton.click();
      fixture.detectChanges();
      expect(page.formErrorMessage).toBeFalsy();

      expect(documentTemplatesService.getCurrentUserDocumentTemplates).toHaveBeenLastCalledWith(
        0,
        30,
        ['OPERATOR'],
        'ref',
      );
    });
  });
});
