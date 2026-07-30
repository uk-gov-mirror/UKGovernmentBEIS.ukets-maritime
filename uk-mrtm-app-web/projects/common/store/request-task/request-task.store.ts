import { Injectable } from '@angular/core';

import { produce } from 'immer';

import {
  ItemDTO,
  RequestActionInfoDTO,
  RequestTaskItemDTO,
  RequestTaskPayload,
  RequestTaskPreviewFileInfoDTO,
} from '@mrtm/api';

import { SignalStore } from '../signal-store';
import { initialRequestTaskState, RequestTaskState } from './request-task.state';

@Injectable({ providedIn: 'root' })
export class RequestTaskStore extends SignalStore<RequestTaskState> {
  constructor() {
    super(initialRequestTaskState);
  }

  setRequestTaskItem(requestTaskItem: RequestTaskItemDTO) {
    this.setState(
      produce(this.state, (state) => {
        state.requestTaskItem = requestTaskItem;
      }),
    );
  }

  setRelatedTasks(relatedTasks: ItemDTO[]) {
    this.setState(
      produce(this.state, (state) => {
        state.relatedTasks = relatedTasks;
      }),
    );
  }

  setTimeline(timeline: RequestActionInfoDTO[]) {
    this.setState(
      produce(this.state, (state) => {
        state.timeline = timeline;
      }),
    );
  }

  setTaskReassignedTo(taskReassignedTo: string) {
    this.setState(
      produce(this.state, (state) => {
        state.taskReassignedTo = taskReassignedTo;
      }),
    );
  }

  setIsEditable(isEditable: boolean) {
    this.setState(
      produce(this.state, (state) => {
        state.isEditable = isEditable;
      }),
    );
  }

  setMetadata(metadata: { [key: string]: unknown }) {
    this.setState(
      produce(this.state, (state) => {
        state.metadata = metadata;
      }),
    );
  }

  setPayload(payload: RequestTaskPayload) {
    this.setState(
      produce(this.state, (state) => {
        state.requestTaskItem.requestTask.payload = payload;
      }),
    );
  }

  setPreviewFiles(previewFiles: { [key: string]: RequestTaskPreviewFileInfoDTO }) {
    this.setState(
      produce(this.state, (state) => {
        (state.requestTaskItem.requestTask.payload as any).previewFiles = previewFiles;
      }),
    );
  }

  setFinalDocumentsGenerationInProgress(finalDocumentsGenerationInProgress: boolean | null) {
    this.setState(
      produce(this.state, (state) => {
        (state.requestTaskItem.requestTask.payload as any).finalDocumentsGenerationInProgress =
          finalDocumentsGenerationInProgress;
      }),
    );
  }

  setFinalDocumentsGenerationSuccessful(finalDocumentsGenerationSuccessful: boolean | null) {
    this.setState(
      produce(this.state, (state) => {
        (state.requestTaskItem.requestTask.payload as any).finalDocumentsGenerationSuccessful =
          finalDocumentsGenerationSuccessful;
      }),
    );
  }
}
