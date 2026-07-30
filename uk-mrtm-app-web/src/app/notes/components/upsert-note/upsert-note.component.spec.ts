import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { AccountNotesService } from '@mrtm/api';

import { DestroySubject } from '@netz/common/services';
import { ActivatedRouteStub, asyncData, BasePage, MockType } from '@netz/common/testing';

import { UpsertNoteComponent } from '@notes/components';
import { mockAccountNotesResults } from '@notes/testing/notes-data.mock';

describe('UpsertNoteComponent', () => {
  let component: UpsertNoteComponent;
  let fixture: ComponentFixture<UpsertNoteComponent>;
  let page: Page;

  const accountId = 1;
  const noteId = 2;
  const activatedRoute = new ActivatedRouteStub();

  const accountNotesService: MockType<AccountNotesService> = {
    createAccountNote: vi.fn().mockReturnValue(asyncData(null)),
    updateAccountNote: vi.fn().mockReturnValue(asyncData(null)),
    getAccountNote: vi.fn().mockReturnValue(asyncData(mockAccountNotesResults.accountNotes[0])),
    uploadAccountNoteFile: vi.fn().mockReturnValue(asyncData({ uuid: '11111111-1111-4111-a111-111111111111' })),
  };

  const runOnPushChangeDetection = async (fixture: ComponentFixture<any>): Promise<void> => {
    const changeDetectorRef = fixture.debugElement.injector.get<ChangeDetectorRef>(ChangeDetectorRef);
    changeDetectorRef.detectChanges();
    return fixture.whenStable();
  };

  @Component({
    standalone: true,
    template: '',
  })
  class NoopComponent {}

  class Page extends BasePage<UpsertNoteComponent> {
    get title() {
      return this.query<HTMLDivElement>('.govuk-heading-l');
    }

    get noteContent() {
      return this.getInputValue('#note');
    }

    set noteContent(value: string) {
      this.setInputValue('#note', value);
    }

    get errors() {
      return this.queryAll<HTMLAnchorElement>('.govuk-error-summary li a');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(UpsertNoteComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'accounts/1', component: NoopComponent }]),
        DestroySubject,
        { provide: AccountNotesService, useValue: accountNotesService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    activatedRoute.setParamMap({ accountId });
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should successfully create a note', async () => {
    activatedRoute.setParamMap({ accountId });
    activatedRoute.setResolveMap({
      heading: 'Add a note',
    });
    createComponent();

    await runOnPushChangeDetection(fixture);

    page.submitButton.click();

    await runOnPushChangeDetection(fixture);

    expect(page.title.textContent).toEqual('Add a note');
    expect(page.filesText).toEqual([]);
    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummary.textContent).toContain('Enter a note');

    page.noteContent = 'A note is added';
    page.submitButton.click();
    await runOnPushChangeDetection(fixture);

    expect(page.errorSummary).toBeFalsy();
    expect(accountNotesService.createAccountNote).toHaveBeenCalledTimes(1);
    expect(accountNotesService.createAccountNote).toHaveBeenCalledWith({
      accountId,
      files: [],
      note: 'A note is added',
    });
  });

  it('should successfully edit a note', async () => {
    activatedRoute.setParamMap({ accountId, noteId });
    activatedRoute.setResolveMap({
      heading: 'Change the note',
    });
    createComponent();

    await runOnPushChangeDetection(fixture);

    expect(page.title.textContent).toEqual('Change the note');
    expect(page.noteContent).toEqual('The note 1');

    await fixture.whenStable();
    await runOnPushChangeDetection(fixture);

    expect(page.filesText).toEqual(['file 1']);

    page.noteContent = 'Note has changed';
    page.submitButton.click();

    await runOnPushChangeDetection(fixture);

    expect(page.errorSummary).toBeFalsy();
    expect(accountNotesService.updateAccountNote).toHaveBeenCalledTimes(1);
    expect(accountNotesService.updateAccountNote).toHaveBeenCalledWith(noteId, {
      files: ['11111111-1111-4111-a111-111111111111'],
      note: 'Note has changed',
    });
  });
});
