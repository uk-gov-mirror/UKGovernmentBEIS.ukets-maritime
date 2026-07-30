import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { Subject } from 'rxjs';

import { FileUuidDTO } from '@mrtm/api';

import { HttpStatuses } from '@netz/common/error';
import { BasePage } from '@netz/common/testing';

import { FileValidators, MultipleFileInputComponent } from '@shared/components';
import { FileUploadService } from '@shared/services';

describe('MultipleFileInputComponent', () => {
  let component: MultipleFileInputComponent;
  let fixture: ComponentFixture<TestComponent>;
  let hostComponent: TestComponent;
  let page: Page;
  let control: FormControl;

  @Component({
    imports: [ReactiveFormsModule, MultipleFileInputComponent],
    standalone: true,
    template: `
      <form [formGroup]="form">
        <mrtm-multiple-file-input formControlName="file" [baseDownloadUrl]="getDownloadUrl()" />
      </form>
    `,
  })
  class TestComponent {
    form = new FormGroup({ file: new FormControl(null) });
    getDownloadUrl() {
      return `/download/`;
    }
  }

  class Page extends BasePage<TestComponent> {
    get downloadLinks() {
      return this.queryAll<HTMLAnchorElement>('.govuk-link');
    }

    get deleteButtons() {
      return this.queryAll<HTMLButtonElement>('.moj-multi-file-upload__delete');
    }

    set files(file: File[]) {
      this.setInputValue('input', file);
    }

    get input() {
      return this.query<HTMLInputElement>('input');
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.debugElement.query(By.directive(MultipleFileInputComponent)).componentInstance;
    hostComponent = fixture.componentInstance;
    page = new Page(fixture);
    control = hostComponent.form.get('file') as FormControl;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current value', () => {
    expect(page.filesText).toHaveLength(0);

    control.setValue([{ file: new File(['abc'], 'Uploaded file'), uuid: '1234' }]);
    fixture.detectChanges();

    expect(page.filesText).toEqual(['Uploaded file']);
    expect(page.downloadLinks.map((link) => link.href)).toEqual([expect.stringContaining('/download/1234')]);
  });

  it('should validate big files', () => {
    const uploadSubject = new Subject<HttpEvent<FileUuidDTO>>();

    expect(control.touched).toBeFalsy();

    control.setValidators(FileValidators.multipleCompose(FileValidators.maxFileSize(1)));
    control.setAsyncValidators(TestBed.inject(FileUploadService).uploadMany(() => uploadSubject));
    const file = new File(['test content'], 'Big file');
    vi.spyOn(file, 'size', 'get').mockReturnValue(1024 * 1024 * 1024);
    page.files = [file];
    fixture.detectChanges();

    expect(control.touched).toBeTruthy();
    expect(page.filesText[0]).toEqual('Big file must be smaller than 1MB');
    expect(control.invalid).toBeTruthy();
    expect(control.errors).toEqual({ 'maxFileSize-0-0': 'Big file must be smaller than 1MB' });
  });

  it('should show progress when uploading new files', () => {
    const uploadSubject = new Subject<HttpEvent<FileUuidDTO>>();

    control.setAsyncValidators(TestBed.inject(FileUploadService).uploadMany(() => uploadSubject));

    control.setValue([{ file: new File(['test content'], 'Existing file'), uuid: 'abcdA' }]);
    page.files = [new File(['test content'], 'New file')];
    uploadSubject.next({ type: HttpEventType.UploadProgress, loaded: 5, total: 15 });
    fixture.detectChanges();

    expect(page.filesText).toEqual(['Existing file', 'New file 33%']);

    uploadSubject.next({ type: HttpEventType.UploadProgress, loaded: 10, total: 15 });
    fixture.detectChanges();

    expect(page.filesText).toEqual(['Existing file', 'New file 67%']);

    uploadSubject.next(new HttpResponse({ status: HttpStatuses.Ok, body: { uuid: 'abcd' } }));
    fixture.detectChanges();

    expect(page.filesText).toEqual(['Existing file', 'New file has been uploaded']);
    expect(page.downloadLinks.map((link) => link.href)).toEqual([
      expect.stringContaining('/download/abcdA'),
      expect.stringContaining('/download/abcd'),
    ]);
  });

  it('should delete existing files', () => {
    control.setValue([{ file: new File(['test content'], 'Existing file') }]);
    fixture.detectChanges();

    page.deleteButtons[0].click();
    fixture.detectChanges();

    expect(page.filesText).toHaveLength(0);
    expect(control.value).toHaveLength(0);
  });

  it('should delete in flight files', () => {
    const uploadSubject = new Subject<HttpEvent<FileUuidDTO>>();
    control.setAsyncValidators(TestBed.inject(FileUploadService).uploadMany(() => uploadSubject));

    control.setValue([{ file: new File(['test content'], 'Existing file'), uuid: 'abcA' }]);
    fixture.detectChanges();

    page.files = [new File(['test content'], 'New file')];
    fixture.detectChanges();

    uploadSubject.next({ type: HttpEventType.UploadProgress, loaded: 5, total: 15 });
    fixture.detectChanges();

    page.deleteButtons[1].click();
    fixture.detectChanges();

    expect(page.filesText).toHaveLength(1);
  });

  it('should disable the control', () => {
    control.disable();
    fixture.detectChanges();

    expect(page.input.disabled).toBeTruthy();
    expect(page.query('label.govuk-button--disabled')).toBeTruthy();
    expect(page.deleteButtons.every((button) => button.disabled)).toBeTruthy();
  });
});
