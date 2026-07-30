import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnInit,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm, UntypedFormControl } from '@angular/forms';

import { BehaviorSubject, combineLatest, filter, map, merge, Observable, startWith, tap, withLatestFrom } from 'rxjs';

import { ErrorMessageComponent, FormService, LabelSizeType, SafeHtmlPipe } from '@netz/govuk-components';

import { FileUploadListComponent } from '@shared/components';
import { FileUploadService } from '@shared/services';
import { FileUpload, FileUploadEvent } from '@shared/types';

@Component({
  selector: 'mrtm-file-input',
  imports: [forwardRef(() => FileUploadListComponent), ErrorMessageComponent, AsyncPipe, SafeHtmlPipe],
  standalone: true,
  templateUrl: './file-input.component.html',
  styleUrl: '../multiple-file-input/multiple-file-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileInputComponent implements OnInit, ControlValueAccessor {
  private readonly ngControl = inject(NgControl, { self: true, optional: true })!;
  private readonly formService = inject(FormService);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly root = inject(FormGroupDirective, { optional: true })!;
  private readonly rootNgForm = inject(NgForm, { optional: true })!;

  readonly label = input<string>();
  readonly labelSize = input<LabelSizeType>('normal');
  readonly isLabelHidden = input(false);
  readonly hint = input<string>();
  readonly listTitle = input<string>();
  readonly text = input<string>();
  readonly showFilesizeHint = input(true);
  readonly showNoFilesHint = input(true);
  readonly showFileUploadList = input(true);
  readonly accepted = input('*/*');
  readonly downloadUrl = input<(uuid: string) => string | string[]>();

  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly currentLabelSize = computed(() => {
    switch (this.labelSize()) {
      case 'small':
        return 'govuk-label govuk-label--s';
      case 'medium':
        return 'govuk-label govuk-label--m';
      case 'large':
        return 'govuk-label govuk-label--l';
      default:
        return 'govuk-label';
    }
  });
  readonly currentHeaderSize = computed(() => {
    switch (this.labelSize()) {
      case 'medium':
        return 'm';
      case 'large':
        return 'm';
      case 'small':
      default:
        return 's';
    }
  });

  uploadedFiles$: Observable<FileUploadEvent[]>;
  isDisabled: boolean;
  onFileBlur: () => any;

  private value$ = new BehaviorSubject<FileUpload>(null);
  private onChange: (value: FileUpload) => any;

  constructor() {
    const ngControl = this.ngControl;

    ngControl.valueAccessor = this;
  }

  get control(): UntypedFormControl {
    return this.ngControl.control as UntypedFormControl;
  }

  get identifier(): string {
    return this.formService.getControlIdentifier(this.ngControl);
  }

  shouldDisplayErrors$: Observable<boolean>;

  private get form(): FormGroupDirective | NgForm | null {
    return this.root ?? this.rootNgForm;
  }

  ngOnInit(): void {
    this.uploadedFiles$ = merge(
      combineLatest([
        this.value$.pipe(map((value) => (value ? { ...value, progress: null } : null))),
        this.control.statusChanges.pipe(
          map(() => this.control.errors),
          startWith(this.control.errors),
        ),
      ]).pipe(map(([value, errors]) => (value ? { ...value, errors } : null))),
      this.fileUploadService.uploadProgress$.pipe(
        withLatestFrom(this.value$),
        filter(([fileEvent, value]) => fileEvent.file === value?.file),
        tap(([uploadEvent, value]) => {
          if (uploadEvent.uuid) {
            this.onChange({ ...value, uuid: uploadEvent.uuid, dimensions: value.dimensions });
          }
        }),
        map(([fileEvent]) => fileEvent),
      ),
    ).pipe(
      map((fileEvent) =>
        fileEvent
          ? [
              {
                ...fileEvent,
                ...(fileEvent.uuid && { downloadUrl: this.downloadUrl()(fileEvent.uuid) }),
              },
            ]
          : [],
      ),
    );

    this.shouldDisplayErrors$ = merge(
      this.uploadedFiles$,
      this.form?.ngSubmit,
      this.form?.valueChanges,
      this.form?.statusChanges,
    ).pipe(map(() => this.control?.invalid && (!this.form || this.form.submitted)));
  }

  registerOnChange(onChange: (value: FileUpload) => any): void {
    this.onChange = (value) => {
      this.value$.next(value);
      onChange(value);
    };
  }

  registerOnTouched(onBlur: () => any): void {
    this.onFileBlur = onBlur;
  }

  writeValue(value: FileUploadEvent): void {
    this.value$.next(value);
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onFileChange(event: Event): void {
    const files = (event.target as HTMLInputElement).files;

    if (files.length === 1) {
      if (this.isImage(files[0])) {
        const fileAsDataURL = window.URL.createObjectURL(files[0]);
        this.getImageFileDimensionsResolver(fileAsDataURL)
          .then((dimensions) => {
            this.uploadFile(files[0], dimensions);
          })
          .catch(() => {
            this.uploadFile(files[0], null);
          });
      } else {
        this.uploadFile(files[0], null);
      }
    }
  }

  onFileDeleteClick(): void {
    this.onChange(null);
    this.input().nativeElement.value = null;
  }

  private uploadFile(file: File, dimensions): void {
    this.onChange({ file, uuid: null, dimensions });
  }

  private isImage(file: File) {
    return file['type'].split('/')[0] == 'image';
  }

  private getImageFileDimensionsResolver = (dataURL) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = function () {
        reject();
      };
      img.src = dataURL;
    });
}
