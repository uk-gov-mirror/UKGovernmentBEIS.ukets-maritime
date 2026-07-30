import { ChangeDetectionStrategy, Component, computed, effect, inject, input, Signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { UntypedFormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { catchError, combineLatest, of, Subject, switchMap, take, takeWhile, timer } from 'rxjs';

import {
  DecisionNotification,
  EmpVariationApplicationReviewRequestTaskPayload,
  RequestDetailsDTO,
  RequestTaskActionProcessDTO,
  RequestTaskDTO,
  RequestTaskPreviewFileInfoDTO,
  TasksService,
} from '@mrtm/api';

import { AuthStore, selectUserId } from '@netz/common/auth';
import { GovukDatePipe } from '@netz/common/pipes';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { LinkDirective } from '@netz/govuk-components';

import { FeedbackBannerStore } from '../feedback-banner';
import { LoadingSpinnerComponent } from '../loading-spinner';
import { PreviewAsyncDocument } from './related-async-documents.providers';

type TaskPreviewFile = PreviewAsyncDocument & RequestTaskPreviewFileInfoDTO;

const POLLING_INTERVAL = 30000;
const MAX_POLL_ATTEMPTS = 20;

@Component({
  selector: 'netz-related-async-documents',
  imports: [LinkDirective, RouterLink, GovukDatePipe, LoadingSpinnerComponent],
  standalone: true,
  templateUrl: './related-async-documents.component.html',
  styleUrl: './related-async-documents.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedAsyncDocumentsComponent {
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly tasksService: TasksService = inject(TasksService);
  private readonly requestTaskStore: RequestTaskStore = inject(RequestTaskStore);
  private readonly notificationBannerStore = inject(FeedbackBannerStore);

  readonly fileDownloadPrePath = input<Array<string>>([]);
  readonly previewDocuments = input.required<PreviewAsyncDocument[]>();
  readonly taskId = input.required<RequestTaskDTO['id'] | RequestDetailsDTO['id']>();
  readonly decisionNotification = input<DecisionNotification>();

  private readonly statePreviewFiles = this.requestTaskStore.select(requestTaskQuery.selectPreviewFiles);
  private readonly refreshTrigger$ = new Subject();
  /**
   * If refreshTrigger$ === 1, it initiates a polling mechanism using a timer.
   * If refreshTrigger$ === 0, it propagates the error state without further processing.
   */
  readonly requestPayload = toSignal(
    combineLatest([toObservable(this.taskId), this.refreshTrigger$]).pipe(
      switchMap(([id, trigger]) => (trigger === 1 ? this.pollTaskItem(id as number) : of(null))),
    ),
  );
  readonly taskPreviewFiles: Signal<TaskPreviewFile[]> = computed(() => {
    const previewFiles = this.statePreviewFiles();

    return this.previewDocuments()
      ? this.previewDocuments().map((data) => ({ ...data, ...previewFiles?.[data.requestGeneratedFileType] }))
      : [];
  });
  private readonly hasInProgressFiles = computed(() => {
    const previewFiles = this.statePreviewFiles();
    return !!previewFiles && Object.values(previewFiles).some((file) => file?.status === 'IN_PROGRESS');
  });
  private readonly hasFailedFiles = computed(() => {
    const previewFiles = this.statePreviewFiles();
    return !!previewFiles && Object.values(previewFiles).some((file) => file?.status === 'FAILED');
  });
  private readonly formGroup: UntypedFormGroup = new UntypedFormGroup({});

  constructor() {
    // a task may load with a generation already running (e.g. page refresh); resume polling for it
    if (this.hasInProgressFiles()) {
      this.refreshTrigger$.next(1);
    }

    effect(() => {
      const hasFailedFiles = this.hasFailedFiles();
      const docGenInProgress = this.requestTaskStore.select(
        requestTaskQuery.selectFinalDocumentsGenerationInProgress,
      )();
      const docGenSuccessful = this.requestTaskStore.select(
        requestTaskQuery.selectFinalDocumentsGenerationSuccessful,
      )();

      if (docGenSuccessful === false) {
        untracked(() => this.setBusinessErrors());
      } else if (hasFailedFiles) {
        untracked(() => this.setRequestErrors());
      } else if (docGenInProgress === true) {
        untracked(() => this.setInProgressBanner());
      }
    });
  }

  /**
   * Processes the given preview document and triggers appropriate refresh events,
   * Mark the file as in progress so its spinner shows before the first response arrives
   */
  generatePreviewFile(previewDocument: PreviewAsyncDocument): void {
    this.clearFormErrors();
    const previousPreviewFiles = this.statePreviewFiles();
    this.requestTaskStore.setPreviewFiles({
      ...previousPreviewFiles,
      [previewDocument.requestGeneratedFileType]: {
        ...previousPreviewFiles?.[previewDocument.requestGeneratedFileType],
        status: 'IN_PROGRESS',
      },
    });

    this.processRequestTaskAction(previewDocument).subscribe((data) => {
      if (data) {
        this.refreshTrigger$.next(1);
      } else {
        this.requestTaskStore.setPreviewFiles(previousPreviewFiles);
        this.refreshTrigger$.next(0);
      }
    });
  }

  /**
   * Initiates polling to fetch task item information by ID at a set interval until a specific condition is met.
   */
  private pollTaskItem(id: number) {
    return timer(0, POLLING_INTERVAL).pipe(
      take(MAX_POLL_ATTEMPTS),
      switchMap(() =>
        this.tasksService.getTaskItemInfoById(id as number).pipe(
          catchError(() => {
            this.setRequestErrors();
            return of(null);
          }),
        ),
      ),
      takeWhile((response) => {
        if (response) {
          this.clearFormErrors();
          const payload = response?.requestTask?.payload as EmpVariationApplicationReviewRequestTaskPayload;
          this.requestTaskStore.setPreviewFiles(payload?.previewFiles);
          this.requestTaskStore.setFinalDocumentsGenerationInProgress(payload?.finalDocumentsGenerationInProgress);
          this.requestTaskStore.setFinalDocumentsGenerationSuccessful(payload?.finalDocumentsGenerationSuccessful);

          return this.hasInProgressFiles();
        }
        return false;
      }, true),
    );
  }

  /**
   * Processes a request task action by sending the necessary data to the task service and handling any errors that occur.
   */
  private processRequestTaskAction(previewDocument: PreviewAsyncDocument) {
    return this.tasksService
      .processRequestTaskAction({
        requestTaskActionType: previewDocument.requestTaskActionType,
        requestTaskId: this.taskId(),
        requestTaskActionPayload: {
          payloadType: previewDocument.requestPayloadType,
          decisionNotification: {
            operators: this.decisionNotification()?.operators ?? [],
            externalContacts: this.decisionNotification()?.externalContacts ?? [],
            signatory: this.decisionNotification()?.signatory ?? this.authStore.select(selectUserId)(),
          },
        },
      } as RequestTaskActionProcessDTO)
      .pipe(
        catchError(() => {
          this.setRequestErrors();
          return of(null);
        }),
        take(1),
      );
  }

  private setBusinessErrors() {
    this.formGroup.setErrors({
      DOCUMENTS_BUSINESS_ERROR:
        "There was a problem with completing the task. Select 'Notify operator of decision' to try again",
    });
    this.notificationBannerStore.setInvalidForm(this.formGroup);
  }

  private setRequestErrors() {
    this.formGroup.setErrors({
      DOCUMENTS_REQUEST_ERROR: 'There was a problem preparing the files. Select to create the file again',
    });
    this.notificationBannerStore.setInvalidForm(this.formGroup);
  }

  private setInProgressBanner() {
    this.notificationBannerStore.setNeutralBanner({
      heading: 'Task is in progress',
      body: 'The task is processing in the background. Once this is complete it will be removed from your task list',
    });
  }

  private clearFormErrors() {
    this.formGroup.reset();
    this.notificationBannerStore.reset();
  }
}
