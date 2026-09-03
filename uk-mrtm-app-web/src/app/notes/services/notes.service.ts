import { HttpEvent } from '@angular/common/http';
import { inject, Service } from '@angular/core';

import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, of, switchMap } from 'rxjs';

import {
  AccountNoteResponse,
  AccountNotesService,
  FileUuidDTO,
  NotePayload,
  RequestNoteResponse,
  RequestNotesService,
} from '@mrtm/api';

import { BusinessErrorService, catchTaskReassignedBadRequest, requestTaskReassignedError } from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';

import { NoteResponseUnion } from '@notes/types';

@Service()
export class NotesService {
  private readonly accountNotesService: AccountNotesService = inject(AccountNotesService);
  private readonly requestNotesService: RequestNotesService = inject(RequestNotesService);
  private readonly pendingRequest: PendingRequestService = inject(PendingRequestService);
  private readonly businessErrorService: BusinessErrorService = inject(BusinessErrorService);

  getNotes(
    accountId: number,
    workflowId: string | null,
    pageSize: number,
    page$: BehaviorSubject<number>,
  ): Observable<NoteResponseUnion> {
    return page$.pipe(distinctUntilChanged()).pipe(
      switchMap((page) => {
        return workflowId
          ? this.requestNotesService.getNotesByRequestId(workflowId, page - 1, pageSize)
          : this.accountNotesService.getNotesByAccountId(accountId, page - 1, pageSize);
      }),
      map((items) => {
        const response: AccountNoteResponse & RequestNoteResponse = items;
        return {
          notes: response?.accountNotes ? response?.accountNotes : response?.requestNotes,
          totalItems: response?.totalItems,
        };
      }),
    );
  }

  upsertNote(
    accountId: number,
    workflowId: string | null,
    noteId: number | null,
    note: string,
    files: string[],
  ): Observable<void> {
    const upsertNoteRequest$ = workflowId
      ? noteId
        ? this.requestNotesService.updateRequestNote(noteId, { note, files })
        : this.requestNotesService.createRequestNote({ requestId: workflowId, note, files })
      : noteId
        ? this.accountNotesService.updateAccountNote(noteId, { note, files })
        : this.accountNotesService.createAccountNote({ accountId, note, files });

    return upsertNoteRequest$.pipe(this.pendingRequest.trackRequest());
  }

  getNotePayload(workflowId: string | null, noteId: number): Observable<NotePayload> {
    return of(noteId).pipe(
      filter((noteId) => !!noteId),
      switchMap((noteId) =>
        workflowId ? this.requestNotesService.getRequestNote(noteId) : this.accountNotesService.getAccountNote(noteId),
      ),
      map((result) => result.payload),
    );
  }

  deleteNote(workflowId: string | null, noteId: number): Observable<void> {
    const deleteRequest$ = workflowId
      ? this.requestNotesService.deleteRequestNote(noteId)
      : this.accountNotesService.deleteAccountNote(noteId);

    return deleteRequest$.pipe(this.pendingRequest.trackRequest());
  }

  uploadNoteFile(accountId: number, workflowId: string, file: File): Observable<HttpEvent<FileUuidDTO>> {
    const uploadRequest$ = workflowId
      ? this.requestNotesService.uploadRequestNoteFile(workflowId, file, 'events', true)
      : this.accountNotesService.uploadAccountNoteFile(accountId, file, 'events', true);

    return uploadRequest$.pipe(
      catchTaskReassignedBadRequest(() =>
        this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError()),
      ),
    );
  }

  getOriginUrl(accountId: string | null, workflowId: string | null): string {
    if (accountId && workflowId) {
      return `/accounts/${accountId}/workflows/${workflowId}`;
    } else if (accountId) {
      return `/accounts/${accountId}`;
    } else if (workflowId) {
      return `/batch-variations/workflows/${workflowId}`;
    }
    throw new Error('Url creation not handled.');
  }

  getDownloadBaseUrl(accountId: string | null, workflowId: string | null): string {
    return `${this.getOriginUrl(accountId, workflowId)}/file-download/`;
  }
}
