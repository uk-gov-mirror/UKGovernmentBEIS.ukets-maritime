import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { AccountNotesService, FileNotesService } from '@mrtm/api';

import { ActivatedRouteStub, mockClass } from '@netz/common/testing';

import { NoteFileDownloadComponent } from '@notes/components';
import { Mocked } from 'vitest';

describe('NoteFileDownloadComponent', () => {
  let component: NoteFileDownloadComponent;
  let fixture: ComponentFixture<NoteFileDownloadComponent>;
  let accountNotesService: Mocked<AccountNotesService>;

  beforeEach(async () => {
    Object.defineProperty(window, 'onfocus', { set: vi.fn() });
    accountNotesService = mockClass(AccountNotesService);
    accountNotesService.generateGetAccountFileNoteToken = vi
      .fn()
      .mockReturnValue(of({ token: 'abce', tokenExpirationMinutes: 1 }));

    const activatedRoute = new ActivatedRouteStub({ accountId: 11 });

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: AccountNotesService, useValue: accountNotesService },
        { provide: FileNotesService, useValue: { configuration: { basePath: '' } } },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    // The component's download pipeline schedules a stray `setTimeout(..., 500)` (and an rxjs
    // token-refresh `timer`) that aren't cleared on destroy; fake timers so they never become real
    // (leaking) resources. The token observable still emits synchronously via `of(...)`.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    fixture = TestBed.createComponent(NoteFileDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the download link', async () => {
    expect(component.url()).toEqual('/v1.0/file-notes/abce');
  });
});
