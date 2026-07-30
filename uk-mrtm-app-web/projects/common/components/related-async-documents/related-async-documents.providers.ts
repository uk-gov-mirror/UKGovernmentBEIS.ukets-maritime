import { InjectionToken, Signal } from '@angular/core';

export type PreviewAsyncDocument = {
  requestGeneratedFileType: 'EMP' | 'OFFICIAL_NOTICE';
  requestPayloadType: string;
  requestTaskActionType: string;
  labelText: string;
  loadingText: string;
  /** Display name for the generated file, overriding the name provided by the backend */
  displayedFileName: string;
  visibleInRelatedActions: boolean;
  visibleInNotify: boolean;
};

export type RelatedPreviewAsyncDocumentsMap = Signal<Record<string, PreviewAsyncDocument[]>>;

export const TASK_RELATED_PREVIEW_ASYNC_DOCUMENTS_MAP = new InjectionToken<RelatedPreviewAsyncDocumentsMap>(
  'Task related preview async documents map',
);
