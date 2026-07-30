import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { combineLatest, expand, map, Observable, of, switchMap, take, tap, timer } from 'rxjs';

import {
  DocumentPreviewService,
  EmpsService,
  FileAttachmentsService,
  FileDocumentsService,
  FileGuidanceService,
  FileToken,
  GuidanceDocumentsService,
  RequestActionAttachmentsHandlingService,
  RequestActionFileDocumentsHandlingService,
  RequestTaskAttachmentsHandlingService,
} from '@mrtm/api';

import { LoadingSpinnerComponent } from '@netz/common/components';
import { BreadcrumbService } from '@netz/common/navigation';
import { LinkDirective } from '@netz/govuk-components';

import { isNil } from '@shared/utils';

export interface FileDownloadInfo {
  request: Observable<Partial<FileToken> & { fileUrl?: string }>;
  fileType: 'attachment' | 'document' | 'document-preview' | 'guidance';
}

@Component({
  selector: 'mrtm-file-download',
  imports: [LinkDirective, LoadingSpinnerComponent],
  standalone: true,
  template: `
    @if (downloadProcessing()) {
      <netz-loading-spinner title="Preparing file to download" />
    } @else {
      <h1 class="govuk-heading-l">Your download is completed</h1>
      <p class="govuk-body">You should see your downloads in the downloads folder.</p>
      <a govukLink [href]="url()" download #anchor>Click to restart download if it fails</a>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDownloadComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly requestTaskAttachmentsHandlingService = inject(RequestTaskAttachmentsHandlingService);
  private readonly requestActionAttachmentsHandlingService = inject(RequestActionAttachmentsHandlingService);
  private readonly requestActionFileDocumentsHandlingService = inject(RequestActionFileDocumentsHandlingService);
  private readonly documentPreviewService = inject(DocumentPreviewService);
  private readonly empsService = inject(EmpsService);
  private readonly guidanceDocumentsService = inject(GuidanceDocumentsService);
  private readonly fileAttachmentsService = inject(FileAttachmentsService);
  private readonly fileDocumentsService = inject(FileDocumentsService);
  private readonly fileGuidanceService = inject(FileGuidanceService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  readonly downloadProcessing: WritableSignal<boolean> = signal(true);
  readonly anchor = viewChild<ElementRef<HTMLAnchorElement>>('anchor');

  private hasDownloadedOnce = false;
  private readonly fileDownloadAttachmentPath = `${this.fileAttachmentsService.configuration.basePath}/v1.0/file-attachments/`;
  private readonly fileDownloadDocumentPath = `${this.fileDocumentsService.configuration.basePath}/v1.0/file-documents/`;
  private readonly fileDownloadGuidancePath = `${this.fileGuidanceService.configuration.basePath}/v1.0/file-guidance/`;

  readonly url = toSignal(
    this.route.paramMap.pipe(
      map((params): FileDownloadInfo => {
        if (params.has('actionId')) {
          return this.requestActionDownloadInfo(params);
        }
        if (params.has('taskId')) {
          return this.requestTaskDownloadInfo(params);
        }
        if (params.has('empId')) {
          return this.empsDownloadInfo(params);
        }
        if (params.has('guidanceSectionId')) {
          return this.guidanceDownloadInfo(params);
        }
        throw new Error('File download request not handled.');
      }),
      switchMap(({ request, fileType }) => {
        return combineLatest([
          of(fileType),
          request.pipe(
            expand((response) => timer(response.tokenExpirationMinutes * 1000 * 60).pipe(switchMap(() => request))),
          ),
        ]);
      }),
      take(1),
      map(([fileType, fileToken]) => {
        switch (fileType) {
          case 'attachment':
            return `${this.fileDownloadAttachmentPath}${encodeURIComponent(String(fileToken.token))}`;
          case 'document-preview':
            return fileToken.fileUrl;
          case 'guidance':
            return `${this.fileDownloadGuidancePath}${encodeURIComponent(String(fileToken.token))}`;
          default:
            return `${this.fileDownloadDocumentPath}${encodeURIComponent(String(fileToken.token))}`;
        }
      }),
      tap(() => {
        setTimeout(() => {
          this.downloadProcessing.set(false);
          this.changeDetectorRef.detectChanges();
        }, 500);
      }),
    ),
  );

  constructor() {
    effect(() => {
      const url = this.url();
      const processing = this.downloadProcessing();
      const anchor = this.anchor();

      if (isNil(anchor) || isNil(url) || this.hasDownloadedOnce || processing) {
        return;
      }

      const fileName = this.route.snapshot.queryParams?.['filename'];

      if (fileName) {
        anchor.nativeElement.setAttribute('download', fileName);
      }

      anchor.nativeElement.click();
      this.hasDownloadedOnce = true;
      onfocus = () => close();
    });
  }

  public ngOnInit() {
    this.breadcrumbService.showDashboardBreadcrumb();
  }

  private requestTaskDownloadInfo(params: ParamMap): FileDownloadInfo {
    const { queryParams } = this.route.snapshot;
    switch (params.get('fileType')) {
      case 'document-preview':
        return {
          request: this.documentPreviewService
            .getDocumentPreview(Number(params.get('taskId')), {
              documentType: params.get('uuid'),
              decisionNotification: {
                operators: [queryParams?.['operators'] ?? []].flat(),
                externalContacts: [queryParams?.['externalContacts'] ?? []].flat(),
                signatory: queryParams?.['signatory'],
              },
            })
            .pipe(
              map((blob: any) => {
                const file = new Blob([blob]);
                return { fileUrl: URL.createObjectURL(file) };
              }),
            ),
          fileType: 'document-preview',
        };
      default:
        return {
          request: this.requestTaskAttachmentsHandlingService.generateRequestTaskGetFileAttachmentToken(
            Number(params.get('taskId')),
            params.get('uuid'),
          ),
          fileType: 'attachment',
        };
    }
  }

  private requestActionDownloadInfo(params: ParamMap): FileDownloadInfo {
    switch (params.get('fileType')) {
      case 'document':
        return {
          request: this.requestActionFileDocumentsHandlingService.generateRequestActionGetFileDocumentToken(
            Number(params.get('actionId')),
            params.get('uuid'),
          ),
          fileType: 'document',
        };
      default:
        return {
          request: this.requestActionAttachmentsHandlingService.generateRequestActionGetFileAttachmentToken(
            Number(params.get('actionId')),
            params.get('uuid'),
          ),
          fileType: 'attachment',
        };
    }
  }

  private empsDownloadInfo(params: ParamMap): FileDownloadInfo {
    if (params.get('fileType') === 'document') {
      return {
        request: this.empsService.generateGetEmpDocumentToken(params.get('empId'), params.get('uuid')),
        fileType: 'document',
      };
    } else {
      return {
        request: this.empsService.generateGetEmpAttachmentToken(params.get('empId'), params.get('uuid')),
        fileType: 'attachment',
      };
    }
  }

  private guidanceDownloadInfo(params: ParamMap): FileDownloadInfo {
    return {
      request: this.guidanceDocumentsService.generateGetGuidanceFileToken(
        Number(params.get('guidanceSectionId')),
        params.get('uuid'),
      ),
      fileType: 'guidance',
    };
  }
}
