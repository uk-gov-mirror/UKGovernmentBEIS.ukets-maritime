import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BehaviorSubject, firstValueFrom, of } from 'rxjs';

import { AccountNotesService, RequestNotesService } from '@mrtm/api';

import { HttpStatuses } from '@netz/common/error';
import { MockType } from '@netz/common/testing';

import { NotesService } from '@notes/services';
import { mockAccountNotesResults, mockRequestNotesResults } from '@notes/testing/notes-data.mock';

describe('NotesService', () => {
  let service: NotesService;

  const mockUUID1 = '11111111-1111-4111-a111-111111111111';
  const mockUUID2 = '22222222-2222-4222-a222-222222222222';
  const mockFile1 = new File([new Blob()], 'uploaded-file1.txt');
  const mockFile2 = new File([new Blob()], 'uploaded-file2.txt');
  const accountNotesService: MockType<AccountNotesService> = {
    getNotesByAccountId: vi.fn().mockReturnValue(of(mockAccountNotesResults)),
    updateAccountNote: vi.fn().mockReturnValue(of({})),
    createAccountNote: vi.fn().mockReturnValue(of({})),
    getAccountNote: vi.fn().mockReturnValue(of(mockAccountNotesResults.accountNotes[0])),
    deleteAccountNote: vi.fn().mockReturnValue(of({})),
    uploadAccountNoteFile: vi
      .fn()
      .mockReturnValue(of(new HttpResponse({ status: HttpStatuses.Ok, body: { uuid: mockUUID1 } }))),
  };
  const requestNotesService: MockType<RequestNotesService> = {
    getNotesByRequestId: vi.fn().mockReturnValue(of(mockRequestNotesResults)),
    updateRequestNote: vi.fn().mockReturnValue(of({})),
    createRequestNote: vi.fn().mockReturnValue(of({})),
    getRequestNote: vi.fn().mockReturnValue(of(mockRequestNotesResults.requestNotes[0])),
    deleteRequestNote: vi.fn().mockReturnValue(of({})),
    uploadRequestNoteFile: vi
      .fn()
      .mockReturnValue(of(new HttpResponse({ status: HttpStatuses.Ok, body: { uuid: mockUUID2 } }))),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RequestNotesService, useValue: requestNotesService },
        { provide: AccountNotesService, useValue: accountNotesService },
      ],
    });
    service = TestBed.inject(NotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call correct service on getNotes and return Observable<NoteResponseUnion>', async () => {
    const page$ = new BehaviorSubject(1);
    const requestNoteResponse = await firstValueFrom(service.getNotes(1, 'WORKFLOW1', 10, page$));
    const accountNoteResponse = await firstValueFrom(service.getNotes(1, null, 10, page$));
    expect(requestNoteResponse).toEqual({
      notes: mockRequestNotesResults.requestNotes,
      totalItems: mockRequestNotesResults.totalItems,
    });
    expect(accountNoteResponse).toEqual({
      notes: mockAccountNotesResults.accountNotes,
      totalItems: mockAccountNotesResults.totalItems,
    });
  });

  it('should call correct service on upsertNote', async () => {
    await firstValueFrom(service.upsertNote(1, 'WORKFLOW1', null, 'workflow1 note', []));
    expect(requestNotesService.createRequestNote).toHaveBeenCalledWith({
      requestId: 'WORKFLOW1',
      note: 'workflow1 note',
      files: [],
    });
    await firstValueFrom(service.upsertNote(1, 'WORKFLOW2', 3, 'workflow2 note', [mockUUID1]));
    expect(requestNotesService.updateRequestNote).toHaveBeenCalledWith(3, {
      note: 'workflow2 note',
      files: [mockUUID1],
    });

    await firstValueFrom(service.upsertNote(1, null, null, 'account1 note', []));
    expect(accountNotesService.createAccountNote).toHaveBeenCalledWith({
      accountId: 1,
      note: 'account1 note',
      files: [],
    });
    await firstValueFrom(service.upsertNote(1, null, 3, 'account2 note', [mockUUID1]));
    expect(accountNotesService.updateAccountNote).toHaveBeenCalledWith(3, {
      note: 'account2 note',
      files: [mockUUID1],
    });
  });

  it('should call correct service on deleteNote', async () => {
    await firstValueFrom(service.deleteNote('WORKFLOW1', 2));
    expect(requestNotesService.deleteRequestNote).toHaveBeenCalledWith(2);
    await firstValueFrom(service.deleteNote(null, 3));
    expect(accountNotesService.deleteAccountNote).toHaveBeenCalledWith(3);
  });

  it('should call correct service on uploadNoteFile', async () => {
    await firstValueFrom(service.uploadNoteFile(1, 'WORKFLOW1', mockFile1));
    expect(requestNotesService.uploadRequestNoteFile).toHaveBeenCalledWith('WORKFLOW1', mockFile1, 'events', true);
    await firstValueFrom(service.uploadNoteFile(1, null, mockFile2));
    expect(accountNotesService.uploadAccountNoteFile).toHaveBeenCalledWith(1, mockFile2, 'events', true);
  });

  it('should call correct service on getNotePayload and return NotePayload', async () => {
    const requestNotePayload = await firstValueFrom(service.getNotePayload('WORKFLOW1', 1));
    const accountNotePayload = await firstValueFrom(service.getNotePayload(null, 1));
    expect(requestNotePayload).toEqual(mockRequestNotesResults.requestNotes[0].payload);
    expect(accountNotePayload).toEqual(mockAccountNotesResults.accountNotes[0].payload);
  });

  it('should return appropriate originUrl', () => {
    expect(service.getOriginUrl('1', null)).toEqual('/accounts/1');
    expect(service.getOriginUrl('1', 'WORKFLOW1')).toEqual('/accounts/1/workflows/WORKFLOW1');
    expect(service.getOriginUrl(null, 'WORKFLOW1')).toEqual('/batch-variations/workflows/WORKFLOW1');
  });

  it('should return appropriate downloadUrl', () => {
    expect(service.getDownloadBaseUrl('1', null)).toEqual('/accounts/1/file-download/');
    expect(service.getDownloadBaseUrl('1', 'WORKFLOW1')).toEqual('/accounts/1/workflows/WORKFLOW1/file-download/');
    expect(service.getDownloadBaseUrl(null, 'WORKFLOW1')).toEqual(
      '/batch-variations/workflows/WORKFLOW1/file-download/',
    );
  });
});
