import { inject, Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';

import { Observable } from 'rxjs';

import { RequestTaskAttachmentActionProcessDTO, RequestTaskAttachmentsHandlingService } from '@mrtm/api';

import {
  BusinessErrorService,
  catchTaskReassignedBadRequest,
  catchTaskUnsafeFileRequest,
  requestTaskReassignedError,
} from '@netz/common/error';

import { createCommonFileValidators } from '@shared/components/file-input/file-validators';
import { FileUploadService } from '@shared/services';
import { FileUploadEvent } from '@shared/types';

@Injectable({ providedIn: 'root' })
export class RequestTaskFileService {
  private readonly fileUploadService = inject(FileUploadService);
  private readonly requestTaskAttachmentsHandlingService = inject(RequestTaskAttachmentsHandlingService);
  private readonly businessErrorService = inject(BusinessErrorService);
  private readonly formBuilder = inject(UntypedFormBuilder);

  readonly upload = (
    requestTaskId: number,
    requestTaskActionType: RequestTaskAttachmentActionProcessDTO['requestTaskActionType'],
  ) => this.fileUploadService.upload((file) => this.storeUpload(requestTaskId, file, requestTaskActionType));

  readonly uploadMany = (
    requestTaskId: number,
    requestTaskActionType: RequestTaskAttachmentActionProcessDTO['requestTaskActionType'],
  ) => this.fileUploadService.uploadMany((file) => this.storeUpload(requestTaskId, file, requestTaskActionType));

  buildFormControl(
    requestTaskId: number,
    uuid: string | string[],
    attachments: { [key: string]: string },
    requestTaskActionType: RequestTaskAttachmentActionProcessDTO['requestTaskActionType'],
    required = false,
    disabled = false,
    requiredMessage = 'Select a file',
  ): UntypedFormControl {
    return this.formBuilder.control(
      {
        value: !uuid
          ? null
          : Array.isArray(uuid)
            ? uuid.map((id) => this.buildFileEvent(id, attachments))
            : this.buildFileEvent(uuid, attachments),
        disabled,
      },
      {
        validators: createCommonFileValidators(required, requiredMessage),
        asyncValidators: [
          Array.isArray(uuid)
            ? this.uploadMany(requestTaskId, requestTaskActionType)
            : this.upload(requestTaskId, requestTaskActionType),
        ],
        updateOn: 'change',
      },
    );
  }

  private buildFileEvent(uuid: string, attachments: { [key: string]: string }): Pick<FileUploadEvent, 'uuid' | 'file'> {
    //todo This should be refactored and replace the store with what is absolutely  necessary.
    // currently an assumption is mde that either the state will have
    // the property key property or the store will have a getter for the specific property
    // check common-tasks.store.ts
    return {
      uuid,
      file: { name: attachments?.[uuid] } as File,
    };
  }

  private storeUpload(
    requestTaskId: number,
    file: File,
    requestTaskActionType: RequestTaskAttachmentActionProcessDTO['requestTaskActionType'],
  ): Observable<any> {
    return this.requestTaskAttachmentsHandlingService
      .uploadRequestTaskAttachment(
        {
          requestTaskActionType,
          requestTaskId,
        },
        file,
        'events',
        true,
      )
      .pipe(
        catchTaskUnsafeFileRequest(),
        catchTaskReassignedBadRequest(() => {
          return this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError());
        }),
      );
  }
}
