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

import { expand, map, Observable, switchMap, tap, timer } from 'rxjs';

import { AccountNotesService, FileNotesService, FileToken, RequestNotesService } from '@mrtm/api';

import { LoadingSpinnerComponent } from '@netz/common/components';
import { BreadcrumbService } from '@netz/common/navigation';
import { LinkDirective } from '@netz/govuk-components';

import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-note-file-download',
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
export class NoteFileDownloadComponent implements OnInit {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly accountNotesService: AccountNotesService = inject(AccountNotesService);
  private readonly requestNotesService: RequestNotesService = inject(RequestNotesService);
  private readonly fileNotesService: FileNotesService = inject(FileNotesService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private hasDownloadedOnce = false;
  private fileNotesPath = `${this.fileNotesService.configuration.basePath}/v1.0/file-notes/`;

  public readonly downloadProcessing: WritableSignal<boolean> = signal(true);
  public readonly anchor = viewChild<ElementRef<HTMLAnchorElement>>('anchor');

  readonly url = toSignal(
    this.route.paramMap.pipe(
      map((params): Observable<FileToken> => {
        return params.has('workflowId') ? this.requestNoteDownloadInfo(params) : this.accountNoteDownloadInfo(params);
      }),
      switchMap((request) =>
        request.pipe(
          expand((response) => timer(response.tokenExpirationMinutes * 1000 * 60).pipe(switchMap(() => request))),
        ),
      ),
      map((fileToken) => {
        return `${this.fileNotesPath}${encodeURIComponent(String(fileToken.token))}`;
      }),
      tap(() => {
        setTimeout(() => {
          this.downloadProcessing.set(false);
          this.changeDetectorRef.detectChanges();
        }, 500);
      }),
    ),
  );

  public ngOnInit(): void {
    this.breadcrumbService.showDashboardBreadcrumb();
  }

  constructor() {
    effect(() => {
      const url = this.url();
      const processing = this.downloadProcessing();
      const anchor = this.anchor();

      if (isNil(anchor) || isNil(url) || this.hasDownloadedOnce || processing) {
        return;
      }

      anchor.nativeElement.click();
      this.hasDownloadedOnce = true;
      onfocus = () => close();
    });
  }

  private requestNoteDownloadInfo(params: ParamMap): Observable<FileToken> {
    return this.requestNotesService.generateGetRequestFileNoteToken(params.get('workflowId'), params.get('uuid'));
  }

  private accountNoteDownloadInfo(params: ParamMap): Observable<FileToken> {
    return this.accountNotesService.generateGetAccountFileNoteToken(
      Number(params.get('accountId')),
      params.get('uuid'),
    );
  }
}
