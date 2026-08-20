import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { of, throwError } from 'rxjs';

import { MaritimeAccountsService } from '@mrtm/api';

import { FeedbackBannerStore } from '@netz/common/components';
import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { mockClass } from '@netz/common/testing';

import { EuXmlImportProcessComponent } from '@requests/common/eu-xml-import/eu-xml-import-process/eu-xml-import-process.component';
import { EuXmlImportSaveService } from '@requests/common/eu-xml-import/eu-xml-import-save.service';
import { taskProviders } from '@requests/common/task.providers';
import { DataParserWizardStepComponent } from '@shared/components';

const VALID_XML = `<?xml version="1.0"?><monitoringPlans><monitoringPlan shipImoNumber="1234567"><ship><name>MV Test</name><shipType>BULK</shipType><grossTonnage>50000</grossTonnage><flag>GB</flag></ship></monitoringPlan></monitoringPlans>`;

const fileSelectEvent = (file: File | null): Event => ({ target: { files: file ? [file] : [] } }) as unknown as Event;

describe('EuXmlImportProcessComponent', () => {
  let component: EuXmlImportProcessComponent;
  let fixture: ComponentFixture<EuXmlImportProcessComponent>;
  let saveService: { save: ReturnType<typeof vi.fn> };
  let accountService: ReturnType<typeof mockClass<MaritimeAccountsService>>;

  beforeEach(async () => {
    saveService = { save: vi.fn() };
    accountService = mockClass(MaritimeAccountsService);
    accountService.getMaritimeAccount.mockReturnValue(of({ account: { imoNumber: '' } } as any));

    await TestBed.configureTestingModule({
      imports: [EuXmlImportProcessComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        ...taskProviders,
        { provide: EuXmlImportSaveService, useValue: saveService },
        { provide: MaritimeAccountsService, useValue: accountService },
      ],
    }).compileComponents();

    const store = TestBed.inject(RequestTaskStore);
    store.setState({
      ...mockRequestTask,
      requestTaskItem: {
        ...mockRequestTask.requestTaskItem,
        requestTask: {
          ...mockRequestTask.requestTaskItem.requestTask,
          type: 'EMP_ISSUANCE_APPLICATION_SUBMIT',
          payload: { payloadType: 'EMP_ISSUANCE_SAVE_APPLICATION_PAYLOAD' },
        },
      },
    });

    fixture = TestBed.createComponent(EuXmlImportProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onFileSelect', () => {
    it('does nothing when no file is chosen', async () => {
      await component.onFileSelect(fileSelectEvent(null));

      expect(component.uploadedFile).toBeNull();
      expect(component.xmlErrors()).toEqual([]);
    });

    it('does not parse a file that fails the form validators', async () => {
      const file = new File(['not xml'], 'test.txt', { type: 'text/plain' });

      await component.onFileSelect(fileSelectEvent(file));

      expect(component.uploadedFile).toBe(file);
      expect(component.parsedData()).toBeNull();
      expect(component.xmlErrors()).toEqual([]);
    });

    it('sets xmlErrors when the XML cannot be turned into a monitoring plan', async () => {
      const file = new File(['not valid xml at all'], 'test.xml', { type: 'text/xml' });

      await component.onFileSelect(fileSelectEvent(file));

      expect(component.xmlErrors().length).toBeGreaterThan(0);
      expect(component.parsedData()).toBeNull();
    });

    it('sets parsedData when the XML is valid', async () => {
      const file = new File([VALID_XML], 'test.xml', { type: 'text/xml' });

      await component.onFileSelect(fileSelectEvent(file));

      expect(component.xmlErrors()).toEqual([]);
      expect(component.parsedData()?.shipEmissions).toHaveLength(1);
    });

    it('fetches the IMO number from the maritime account and makes it available for parsing', async () => {
      accountService.getMaritimeAccount.mockReturnValue(of({ account: { imoNumber: '7654321' } } as any));
      fixture = TestBed.createComponent(EuXmlImportProcessComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(accountService.getMaritimeAccount).toHaveBeenCalledWith(1);
      expect(component.accountImoNumber()).toBe('7654321');
    });

    it('resets previously shown errors and confirmation state before processing the new file', async () => {
      component.xmlErrors.set([{ row: null, column: null, message: 'stale error' }]);
      component.showConfirmation.set(true);

      await component.onFileSelect(fileSelectEvent(null));

      expect(component.showConfirmation()).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('sets an error and flags the wizard summary as displayed when no file has been parsed yet', () => {
      component.onSubmit(false);

      expect(component.xmlErrors()).toEqual([{ row: null, column: null, message: 'Upload a file' }]);
      expect(component.showConfirmation()).toBe(false);
      expect(component.wizardStep()?.isSummaryDisplayedSubject.value).toBe(true);
    });

    it('does not overwrite existing xmlErrors', () => {
      component.xmlErrors.set([{ row: null, column: null, message: 'existing error' }]);

      component.onSubmit(false);

      expect(component.xmlErrors()).toEqual([{ row: null, column: null, message: 'existing error' }]);
    });

    it('shows the confirmation step instead of saving when asked to confirm', async () => {
      await component.onFileSelect(fileSelectEvent(new File([VALID_XML], 'test.xml', { type: 'text/xml' })));

      component.onSubmit(true);

      expect(component.showConfirmation()).toBe(true);
      expect(saveService.save).not.toHaveBeenCalled();
    });

    it('saves immediately, skipping confirmation, when there is nothing to overwrite', async () => {
      saveService.save.mockReturnValue(of(undefined));
      await component.onFileSelect(fileSelectEvent(new File([VALID_XML], 'test.xml', { type: 'text/xml' })));

      component.onSubmit(false);

      expect(component.showConfirmation()).toBe(false);
      expect(saveService.save).toHaveBeenCalledWith(component.parsedData());
    });
  });

  describe('confirmImport', () => {
    beforeEach(async () => {
      await component.onFileSelect(fileSelectEvent(new File([VALID_XML], 'test.xml', { type: 'text/xml' })));
    });

    it('saves the parsed data, shows a success message and navigates away on success', () => {
      const router = TestBed.inject(Router);
      const feedbackBannerStore = TestBed.inject(FeedbackBannerStore);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      saveService.save.mockReturnValue(of(undefined));

      component.confirmImport();

      expect(saveService.save).toHaveBeenCalledWith(component.parsedData());
      expect(navigateSpy).toHaveBeenCalledWith(['../'], expect.anything());
      expect(component.saveError()).toBe(false);
      expect(feedbackBannerStore.state.successMessages).toEqual(['The data import from the XML file was successful.']);
    });

    it('sets saveError when the save fails', () => {
      saveService.save.mockReturnValue(throwError(() => new Error('failed')));

      component.confirmImport();

      expect(component.saveError()).toBe(true);
    });
  });

  describe('cancelConfirmation', () => {
    it('hides the confirmation step', () => {
      component.showConfirmation.set(true);

      component.cancelConfirmation();

      expect(component.showConfirmation()).toBe(false);
    });
  });

  describe('template rendering', () => {
    it('shows "No file chosen" by default and the file name once one is selected', async () => {
      expect(fixture.nativeElement.textContent).toContain('No file chosen');

      const file = new File([VALID_XML], 'test.xml', { type: 'text/xml' });
      await component.onFileSelect(fileSelectEvent(file));
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('test.xml');
    });

    it('shows the in-progress-subtasks warning when a subtask has already been started', () => {
      const store = TestBed.inject(RequestTaskStore);
      store.setState({
        ...store.state,
        requestTaskItem: {
          ...store.state.requestTaskItem,
          requestTask: {
            ...store.state.requestTaskItem.requestTask,
            payload: {
              payloadType: 'EMP_ISSUANCE_SAVE_APPLICATION_PAYLOAD',
              empSectionsCompleted: { sources: 'IN_PROGRESS' },
            } as any,
          },
        },
      });
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(
        'If you import data from an XML, all of the data that has been entered will be replaced.',
      );
    });

    it('shows the replace-data confirmation prompt once showConfirmation is set', () => {
      component.showConfirmation.set(true);
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Are you sure you want to replace the data?');
      expect(text).toContain('All previously entered data will be overwritten by the new file.');
    });

    it('wires the wizard step formSubmit output to onSubmit, passing whether confirmation is needed', async () => {
      const store = TestBed.inject(RequestTaskStore);
      store.setState({
        ...store.state,
        requestTaskItem: {
          ...store.state.requestTaskItem,
          requestTask: {
            ...store.state.requestTaskItem.requestTask,
            payload: {
              payloadType: 'EMP_ISSUANCE_SAVE_APPLICATION_PAYLOAD',
              empSectionsCompleted: { sources: 'IN_PROGRESS' },
            } as any,
          },
        },
      });
      await component.onFileSelect(fileSelectEvent(new File([VALID_XML], 'test.xml', { type: 'text/xml' })));
      fixture.detectChanges();

      const wizardStep = fixture.debugElement.query(By.directive(DataParserWizardStepComponent));
      wizardStep.componentInstance.formSubmit.emit(component['formGroup']);

      expect(component.showConfirmation()).toBe(true);
      expect(saveService.save).not.toHaveBeenCalled();
    });
  });
});
