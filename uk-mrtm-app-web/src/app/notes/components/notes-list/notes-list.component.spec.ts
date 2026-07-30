import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { AccountNotesService } from '@mrtm/api';

import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { NotesListComponent } from '@notes/components';
import { mockAccountNotesResults } from '@notes/testing/notes-data.mock';

describe('NotesListComponent', () => {
  let component: NotesListComponent;
  let fixture: ComponentFixture<NotesListComponent>;
  let page: Page;

  const accountNotesService: MockType<AccountNotesService> = {
    getNotesByAccountId: vi.fn().mockReturnValue(of(mockAccountNotesResults)),
  };
  const activatedRoute = new ActivatedRouteStub({ accountId: '1' });

  class Page extends BasePage<NotesListComponent> {
    get notesContent() {
      return this.queryAll<HTMLDivElement>('.govuk-summary-list__row')
        .map((row) => [row.querySelectorAll('dd')[0]])
        .map((pair) => pair.map((element) => element.textContent.trim()));
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AccountNotesService, useValue: accountNotesService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesListComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    vi.clearAllMocks();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show notes', () => {
    expect(accountNotesService.getNotesByAccountId).toHaveBeenCalledTimes(1);
    expect(accountNotesService.getNotesByAccountId).toHaveBeenLastCalledWith(1, 0, 10);

    expect(page.notesContent).toEqual([
      ['The note 1\nfile 1Submitter 1, 24 Nov 2022, 2:00pm'],
      ['The note 2\nNot providedSubmitter 2, 25 Nov 2022, 3:00pm'],
    ]);
  });
});
