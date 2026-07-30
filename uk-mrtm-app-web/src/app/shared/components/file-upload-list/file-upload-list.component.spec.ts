import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { BasePage } from '@netz/common/testing';

import { FileUploadListComponent } from '@shared/components';
import { FileUploadEvent } from '@shared/types';

describe('FileUploadListComponent', () => {
  let component: FileUploadListComponent;
  let fixture: ComponentFixture<TestComponent>;
  let hostComponent: TestComponent;
  let page: Page;

  @Component({
    imports: [FileUploadListComponent],
    standalone: true,
    template: `
      <mrtm-file-upload-list
        [listTitle]="listTitle()"
        [files]="files()"
        (fileDelete)="onDelete($any($event))"
        [isDisabled]="isDisabled()" />
    `,
  })
  class TestComponent {
    readonly listTitle = signal<string>(undefined);
    readonly files = signal<FileUploadEvent[]>([]);
    readonly isDisabled = signal<boolean>(false);

    onDeleteSpy = vi.fn<(index: number) => void>();

    onDelete(index: number) {
      this.onDeleteSpy(index);
    }
  }

  class Page extends BasePage<TestComponent> {
    get listTitle() {
      return this.query<HTMLDivElement>('.govuk-heading-m');
    }

    get rows() {
      return this.queryAll<HTMLDivElement>('.moj-multi-file-upload__row');
    }

    get files() {
      return this.queryAll<HTMLDataElement>('.moj-multi-file-upload__message');
    }

    get deleteButtons() {
      return this.queryAll<HTMLButtonElement>('.moj-multi-file-upload__delete');
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(FileUploadListComponent)).componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the list title', () => {
    const listTitle = 'This is a list title';
    hostComponent.listTitle.set(listTitle);
    fixture.detectChanges();

    expect(page.listTitle.textContent.trim()).toBe(listTitle);
  });

  it('should list the files and their status', () => {
    hostComponent.files.set([
      { file: { name: 'Uploaded file' } as File, uuid: '1234', progress: null },
      { file: new File([], 'Test file'), uuid: '1254', errors: null, progress: 1 },
      { file: new File([], 'Test file 2'), uuid: null, errors: null, progress: 0.3 },
      { file: new File([], 'Test file 3'), uuid: null, errors: { upload: 'Could not upload' }, progress: null },
    ]);
    fixture.detectChanges();

    expect(page.rows).toHaveLength(4);
    expect(page.files.map((row) => row.textContent.trim())).toEqual([
      'Uploaded file',
      'Test file has been uploaded',
      'Test file 2 30%',
      'Could not upload',
    ]);
    expect(page.deleteButtons).toHaveLength(4);
  });

  it('should emit whenever a file is deleted', () => {
    hostComponent.onDeleteSpy.mockClear();
    hostComponent.files.set([
      { file: { name: 'Uploaded file' } as File, uuid: '1234', progress: null },
      { file: new File([], 'Test file 3'), uuid: null, errors: { upload: 'Could not upload' }, progress: null },
    ]);
    fixture.detectChanges();

    page.deleteButtons[0].click();
    fixture.detectChanges();

    expect(hostComponent.onDeleteSpy).toHaveBeenCalledWith(0);
  });

  it('should disable the delete button', () => {
    expect(page.deleteButtons.some((button) => button.disabled)).toBeFalsy();

    hostComponent.isDisabled.set(true);
    fixture.detectChanges();

    expect(page.deleteButtons.every((button) => button.disabled)).toBeTruthy();
  });
});
