import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, OnInit, viewChild } from '@angular/core';
import { ControlValueAccessor, NgControl, UntypedFormControl } from '@angular/forms';

import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  scan,
  startWith,
  Subject,
  tap,
  withLatestFrom,
} from 'rxjs';

import { FormService, MessageValidationErrors, SafeHtmlPipe } from '@netz/govuk-components';

import { FileUploadListComponent } from '@shared/components';
import { FileUploadService } from '@shared/services';
import { FileUpload, FileUploadEvent } from '@shared/types';

/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: 'mrtm-multiple-file-input[baseDownloadUrl]',
  imports: [FileUploadListComponent, AsyncPipe, SafeHtmlPipe],
  standalone: true,
  templateUrl: './multiple-file-input.component.html',
  styleUrl: './multiple-file-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultipleFileInputComponent implements ControlValueAccessor, OnInit {
  private readonly ngControl = inject(NgControl, { self: true, optional: true })!;
  private readonly formService = inject(FormService);
  private readonly fileUploadService = inject(FileUploadService);

  readonly headerSize = input<'m' | 's'>('m');
  readonly listTitle = input<string>();
  readonly label = input('Upload a file');
  readonly hint = input<string>();
  readonly accepted = input('*/*');
  readonly uploadStatusText = input('Uploading files, please wait');
  readonly dropzoneHintText = input('Drag and drop files here or');
  readonly dropzoneButtonText = input('Choose files');
  readonly baseDownloadUrl = input<string>();
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('input');

  uploadStatusText$ = new Subject<string>();
  uploadedFiles$: Observable<FileUploadEvent[]>;
  isFocused = false;
  isDraggedOver = false;
  isDisabled: boolean;
  private onChange: (value: FileUpload[]) => any;
  private onBlur: () => any;
  private value$ = new BehaviorSubject<FileUpload[]>([]);

  constructor() {
    const ngControl = this.ngControl;

    ngControl.valueAccessor = this;
  }

  get id(): string {
    return this.formService.getControlIdentifier(this.ngControl);
  }

  private get control(): UntypedFormControl {
    return this.ngControl.control as UntypedFormControl;
  }

  ngOnInit(): void {
    this.uploadedFiles$ = combineLatest([
      this.value$,
      this.control.statusChanges.pipe(
        startWith(this.control.status),
        //as we now have async validators we should update errors on final statuses (VALID, INVALID)
        filter((status) => status !== 'PENDING'),
        map(() => this.control.errors),
        startWith(this.control.errors),
      ),
      this.fileUploadService.uploadProgress$.pipe(
        withLatestFrom(this.value$),
        filter(([uploadEvent, value]) => value?.some(({ file }) => file === uploadEvent.file)),
        tap(([{ progress, ...uploadEvent }, value]) => {
          if (uploadEvent.uuid) {
            value.splice(
              value.findIndex((upload) => upload.file === uploadEvent.file),
              1,
              uploadEvent,
            );
          }
        }),
        map(([uploadEvent]) => uploadEvent),
        startWith(undefined),
      ),
    ]).pipe(
      scan(
        (acc, [existing, errors, uploadEvent]) =>
          (existing ?? []).map((existingFile, index) => {
            return {
              ...existingFile,
              ...acc.find(({ file, uuid }) => (uuid && uuid === existingFile.uuid) || file === existingFile.file),
              ...(uploadEvent?.file === existingFile.file ? uploadEvent : {}),
              ...(existingFile.uuid && { downloadUrl: this.baseDownloadUrl() + `${existingFile.uuid}` }),
              errors: this.applyRowErrors(errors, index),
            };
          }),
        [],
      ),
    );
  }

  registerOnChange(onChange: (value: FileUpload[]) => any): void {
    this.onChange = (value) => {
      this.value$.next(value);
      onChange(value);
    };
  }

  registerOnTouched(onBlur: () => any): void {
    this.onBlur = onBlur;
  }

  writeValue(value: FileUploadEvent[]): void {
    this.value$.next(value ?? []);
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onFileChange(event: Event): void {
    const files = (event?.target as HTMLInputElement)?.files;
    this.uploadFiles(files);
    this.fileInput().nativeElement.value = null;
    this.fileInput().nativeElement.focus();
  }

  onFileFocus(): void {
    this.isFocused = true;
  }

  onFileBlur(): void {
    this.isFocused = false;
    this.onBlur();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();

    if (!this.isDisabled) {
      this.isDraggedOver = true;
    }
  }

  onDragLeave(): void {
    this.isDraggedOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggedOver = false;

    if (!this.isDisabled) {
      this.uploadStatusText$.next(this.uploadStatusText());
      this.uploadFiles(event.dataTransfer.files);
    }
  }

  onFileDeleteClick(deletedIndex: number): void {
    this.onChange(this.value$.getValue().filter((_, index) => index !== deletedIndex));
  }

  private uploadFiles(files: FileList): void {
    this.onChange(this.value$.getValue().concat(Array.from(files).map((file) => ({ file }))));
  }

  private applyRowErrors(errors: MessageValidationErrors, index: number): MessageValidationErrors {
    const rowErrors = Object.entries(errors ?? {}).filter(([key]) => key.endsWith(`-${index}`));

    return rowErrors.length === 0
      ? null
      : rowErrors.reduce((acc, [key, value]) => ({ ...(acc ? acc : {}), [key]: value }) as any, null);
  }
}
