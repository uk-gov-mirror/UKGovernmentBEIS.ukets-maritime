import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { of, throwError } from 'rxjs';

import { RequestTaskItemDTO, TasksService } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, mockClass } from '@netz/common/testing';

import { Mock } from 'vitest';

import { FeedbackBannerStore } from '../feedback-banner';
import { RelatedAsyncDocumentsComponent } from './related-async-documents.component';
import { PreviewAsyncDocument } from './related-async-documents.providers';

describe('RelatedAsyncDocumentsComponent', () => {
  let component: RelatedAsyncDocumentsComponent;
  let fixture: ComponentFixture<RelatedAsyncDocumentsComponent>;
  let store: AuthStore;
  let requestTaskStore: RequestTaskStore;
  let feedbackBannerStore: FeedbackBannerStore;
  let tasksService: TasksService;
  let page: Page;

  const mockRequestTaskItem: RequestTaskItemDTO = {
    requestTask: {
      id: 1337,
      assigneeUserId: '7b91199c-4770-4d4b-a0ed-d6d9667de157',
      payload: {
        previewFiles: {
          OFFICIAL_NOTICE: {
            status: 'IN_PROGRESS',
          },
          EMP: {
            file: { uuid: '22222222-2222-4222-a222-222222222222', name: 'UK-E-MA-00033 v6.pdf' },
            status: 'COMPLETED',
            createdDate: '2023-01-01T00:00:00Z',
          },
        },
        finalDocumentsGenerationInProgress: true,
        finalDocumentsGenerationSuccessful: false,
      } as any,
    },
  };
  const mockPreviewAsyncDocuments: PreviewAsyncDocument[] = [
    {
      requestGeneratedFileType: 'OFFICIAL_NOTICE',
      requestPayloadType: 'EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD',
      requestTaskActionType: 'EMP_VARIATION_SUBMIT_REGULATOR_LED_PREVIEW_OFFICIAL_DOCUMENT',
      labelText: 'Create letter preview file',
      loadingText: 'Creating letter preview file',
      displayedFileName: 'Letter_preview.pdf',
      visibleInRelatedActions: true,
      visibleInNotify: true,
    },
    {
      requestGeneratedFileType: 'EMP',
      requestPayloadType: 'EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD',
      requestTaskActionType: 'EMP_VARIATION_SUBMIT_REGULATOR_LED_PREVIEW_EMP_DOCUMENT',
      labelText: 'Create emissions monitoring plan file',
      loadingText: 'Creating emissions monitoring plan file',
      displayedFileName: 'emissions_monitoring_plan_preview.pdf',
      visibleInRelatedActions: true,
      visibleInNotify: true,
    },
  ];

  class Page extends BasePage<RelatedAsyncDocumentsComponent> {
    get links() {
      return this.queryAll<HTMLAnchorElement>('li a, li span');
    }

    get loadingSpinner() {
      return this.query('netz-loading-spinner');
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'file-download/:uuid', redirectTo: '' }]),
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub(),
        },
        {
          provide: TasksService,
          useValue: mockClass(TasksService),
        },
      ],
    }).overrideComponent(RelatedAsyncDocumentsComponent, {
      set: { host: { 'test-id': 'component-spec' } },
    });

    store = TestBed.inject(AuthStore);
    store.setUserState({ userId: 'test-user-id' });

    requestTaskStore = TestBed.inject(RequestTaskStore);
    requestTaskStore.setRequestTaskItem(mockRequestTaskItem);

    feedbackBannerStore = TestBed.inject(FeedbackBannerStore);
    tasksService = TestBed.inject(TasksService);
    // default state has an IN_PROGRESS file, so every created component auto-starts polling;
    // give the poll a benign response so stray timers never call .pipe on undefined
    (tasksService.getTaskItemInfoById as Mock).mockReturnValue(of(null));

    fixture = TestBed.createComponent(RelatedAsyncDocumentsComponent);
    fixture.componentRef.setInput('previewDocuments', mockPreviewAsyncDocuments);
    fixture.componentRef.setInput('taskId', mockRequestTaskItem.requestTask.id);
    fixture.componentRef.setInput('fileDownloadPrePath', []);
    component = fixture.componentInstance;
    page = new Page(fixture);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display all HTML elements', () => {
    fixture.detectChanges();
    expect(page.links.map((el) => el.textContent?.trim())).toEqual([
      'Creating letter preview file...',
      'emissions_monitoring_plan_preview.pdf',
      'Created on 1 Jan 2023, 12:00am',
      'Update',
    ]);
  });

  it('should display loading state', () => {
    requestTaskStore.setPreviewFiles({
      EMP: {
        status: 'IN_PROGRESS',
      } as any,
    });
    fixture.detectChanges();

    expect(page.loadingSpinner).toBeTruthy();
    expect(page.links.map((el) => el.textContent?.trim())).toEqual([
      'Create letter preview file',
      'Creating emissions monitoring plan file...',
    ]);
  });

  it('should handle document generation success and polling', () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    (tasksService.processRequestTaskAction as Mock).mockReturnValue(of({}));
    (tasksService.getTaskItemInfoById as Mock).mockReturnValue(
      of({
        requestTask: {
          payload: {
            previewFiles: {
              OFFICIAL_NOTICE: {
                status: 'COMPLETED',
                file: { uuid: '11111111-1111-4111-a111-111111111111', name: 'emp_variation_approved.pdf' },
                createdDate: '2023-01-01T00:00:00Z',
              },
              EMP: {
                file: { uuid: '22222222-2222-4222-a222-222222222222', name: 'UK-E-MA-00033 v6.pdf' },
                status: 'COMPLETED',
                createdDate: '2023-01-01T00:00:00Z',
              },
            },
          },
        },
      }),
    );

    const generateBtn = page.links[3];
    generateBtn.click();
    vi.advanceTimersByTime(0);

    expect(tasksService.processRequestTaskAction).toHaveBeenCalled();
    expect(tasksService.getTaskItemInfoById).toHaveBeenCalledWith(1337);

    fixture.detectChanges();
    expect(page.links.map((el) => el.textContent?.trim())).toEqual([
      'Letter_preview.pdf',
      'Created on 1 Jan 2023, 12:00am',
      'Update',
      'emissions_monitoring_plan_preview.pdf',
      'Created on 1 Jan 2023, 12:00am',
      'Update',
    ]);
  });

  it('should handle document generation failure', () => {
    fixture.detectChanges();
    const setInvalidFormSpy = vi.spyOn(feedbackBannerStore, 'setInvalidForm');
    (tasksService.processRequestTaskAction as Mock).mockReturnValue(throwError(() => new Error('Error')));

    const generateBtn = page.links[3];
    generateBtn.click();

    expect(setInvalidFormSpy).toHaveBeenCalled();
  });

  it('should set neutral banner when final documents generation is in progress', () => {
    const setNeutralBannerSpy = vi.spyOn(feedbackBannerStore, 'setNeutralBanner');
    requestTaskStore.setPayload({
      ...mockRequestTaskItem.requestTask.payload,
      previewFiles: {},
      finalDocumentsGenerationInProgress: true,
      finalDocumentsGenerationSuccessful: undefined,
    } as any);

    fixture = TestBed.createComponent(RelatedAsyncDocumentsComponent);
    fixture.componentRef.setInput('previewDocuments', mockPreviewAsyncDocuments);
    fixture.componentRef.setInput('taskId', mockRequestTaskItem.requestTask.id);
    fixture.detectChanges();

    expect(setNeutralBannerSpy).toHaveBeenCalledWith({
      heading: 'Task is in progress',
      body: 'The task is processing in the background. Once this is complete it will be removed from your task list',
    });
  });

  it('should set business errors in constructor', () => {
    requestTaskStore.setPayload({
      finalDocumentsGenerationInProgress: false,
      finalDocumentsGenerationSuccessful: false,
    } as any);

    const setInvalidFormSpy = vi.spyOn(feedbackBannerStore, 'setInvalidForm');

    fixture = TestBed.createComponent(RelatedAsyncDocumentsComponent);
    fixture.componentRef.setInput('previewDocuments', mockPreviewAsyncDocuments);
    fixture.componentRef.setInput('taskId', mockRequestTaskItem.requestTask.id);
    fixture.detectChanges();

    expect(setInvalidFormSpy).toHaveBeenCalled();
  });

  it('should set request errors when a preview file has FAILED status', () => {
    const setInvalidFormSpy = vi.spyOn(feedbackBannerStore, 'setInvalidForm');
    requestTaskStore.setPayload({
      ...mockRequestTaskItem.requestTask.payload,
      previewFiles: { OFFICIAL_NOTICE: { status: 'FAILED' } },
      finalDocumentsGenerationInProgress: undefined,
      finalDocumentsGenerationSuccessful: undefined,
    } as any);
    fixture.detectChanges();

    expect(setInvalidFormSpy).toHaveBeenCalled();
    const form = setInvalidFormSpy.mock.calls[0][0];
    expect(form.errors).toEqual({
      DOCUMENTS_REQUEST_ERROR: 'There was a problem preparing the files. Select to create the file again',
    });
  });

  it('should set request errors when polling returns a FAILED preview file', () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    const setInvalidFormSpy = vi.spyOn(feedbackBannerStore, 'setInvalidForm');
    (tasksService.processRequestTaskAction as Mock).mockReturnValue(of({}));
    (tasksService.getTaskItemInfoById as Mock).mockReturnValue(
      of({
        requestTask: {
          payload: {
            previewFiles: {
              OFFICIAL_NOTICE: { status: 'FAILED' },
            },
          },
        },
      }),
    );

    const generateBtn = page.links[3];
    generateBtn.click();
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(tasksService.getTaskItemInfoById).toHaveBeenCalledWith(1337);
    expect(setInvalidFormSpy).toHaveBeenCalled();
    const form = setInvalidFormSpy.mock.calls.at(-1)[0];
    expect(form.errors).toEqual({
      DOCUMENTS_REQUEST_ERROR: 'There was a problem preparing the files. Select to create the file again',
    });
  });

  it('should handle polling until completion', () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    (tasksService.processRequestTaskAction as Mock).mockReturnValue(of({}));
    (tasksService.getTaskItemInfoById as Mock)
      .mockReturnValueOnce(
        of({
          requestTask: {
            payload: {
              previewFiles: {
                OFFICIAL_NOTICE: { status: 'IN_PROGRESS' },
              },
            },
          },
        }),
      )
      .mockReturnValueOnce(
        of({
          requestTask: {
            payload: {
              previewFiles: {
                OFFICIAL_NOTICE: {
                  status: 'COMPLETED',
                  file: { uuid: '11111111-1111-4111-a111-111111111111', name: 'emp_variation_approved.pdf' },
                  createdDate: '2023-01-01T00:00:00Z',
                },
              },
            },
          },
        }),
      );

    const generateBtn = page.links[3];
    generateBtn.click();
    vi.advanceTimersByTime(0);

    expect(tasksService.getTaskItemInfoById).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(30000); // next poll

    expect(tasksService.getTaskItemInfoById).toHaveBeenCalledTimes(2);

    fixture.detectChanges();
    expect(page.links[0].textContent?.trim()).toEqual('Letter_preview.pdf');
  });
});
