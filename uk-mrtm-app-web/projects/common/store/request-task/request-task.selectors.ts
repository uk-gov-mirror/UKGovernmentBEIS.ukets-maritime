import { pipe } from 'rxjs';
import { produce } from 'immer';
import { isBefore } from 'date-fns';

import {
  ItemDTO,
  RequestActionInfoDTO,
  RequestInfoDTO,
  RequestTaskDTO,
  RequestTaskItemDTO,
  RequestTaskPayload,
  RequestTaskPreviewFileInfoDTO,
} from '@mrtm/api';

import { createAggregateSelector, createDescendingSelector, createSelector, StateSelector } from '../index';
import { RequestTaskState } from './request-task.state';

type RequestTaskActions = RequestTaskItemDTO['allowedRequestTaskActions'];

const selectRequestTaskItem: StateSelector<RequestTaskState, RequestTaskItemDTO> = createSelector(
  (state) => state?.requestTaskItem,
);

const selectAllowedRequestTaskActions: StateSelector<
  RequestTaskState,
  RequestTaskItemDTO['allowedRequestTaskActions']
> = createDescendingSelector(selectRequestTaskItem, (state) => state?.allowedRequestTaskActions);

const selectRelatedActions: StateSelector<RequestTaskState, RequestTaskActions> = createDescendingSelector(
  selectRequestTaskItem,
  (state) => state?.allowedRequestTaskActions,
);

const selectRequestInfo: StateSelector<RequestTaskState, RequestInfoDTO> = createDescendingSelector(
  selectRequestTaskItem,
  (state) => state?.requestInfo,
);

const selectRequestTaskAccountId: StateSelector<RequestTaskState, number> = createDescendingSelector(
  selectRequestInfo,
  (requestInfo) => {
    const accountId = requestInfo?.resources[requestInfo?.resourceType];

    return accountId ? parseInt(accountId) : undefined;
  },
);

const selectRequestTaskCompetentAuthority: StateSelector<RequestTaskState, string> = createDescendingSelector(
  selectRequestInfo,
  (requestInfo) => requestInfo?.resources['CA'],
);

const selectRequestId: StateSelector<RequestTaskState, string> = createDescendingSelector(
  selectRequestInfo,
  (state) => state?.id,
);

const selectRequestType: StateSelector<RequestTaskState, RequestInfoDTO['type']> = createDescendingSelector(
  selectRequestInfo,
  (state) => state?.type,
);

const selectRequestMetadata: StateSelector<RequestTaskState, RequestInfoDTO['requestMetadata']> =
  createDescendingSelector(selectRequestInfo, (state) => state?.requestMetadata);

const selectRequestTask: StateSelector<RequestTaskState, RequestTaskDTO> = createDescendingSelector(
  selectRequestTaskItem,
  (state) => state?.requestTask,
);

const selectRequestTaskId: StateSelector<RequestTaskState, number> = createDescendingSelector(
  selectRequestTask,
  (state) => state?.id,
);

const selectUserAssignCapable: StateSelector<RequestTaskState, boolean> = createDescendingSelector(
  selectRequestTaskItem,
  (state) => state?.userAssignCapable,
);

const selectIsAssignable: StateSelector<RequestTaskState, boolean> = createDescendingSelector(
  selectRequestTask,
  (state) => state.assignable,
);

const selectIsAssignActionVisible: StateSelector<RequestTaskState, boolean> = createAggregateSelector(
  selectUserAssignCapable,
  selectIsAssignable,
  (userAssignCapable, assignable) => userAssignCapable && assignable,
);

const selectRequestTaskPayload: StateSelector<RequestTaskState, RequestTaskPayload> = createDescendingSelector(
  selectRequestTask,
  (state) => state?.payload,
);

const selectAssigneeUserId: StateSelector<RequestTaskState, string> = createDescendingSelector(
  selectRequestTask,
  (state) => state?.assigneeUserId,
);

const selectAssigneeFullName: StateSelector<RequestTaskState, string> = createDescendingSelector(
  selectRequestTask,
  (state) => state?.assigneeFullName,
);

const selectRequestTaskType: StateSelector<RequestTaskState, RequestTaskDTO['type']> = createDescendingSelector(
  selectRequestTask,
  (state) => state?.type,
);

const selectRelatedTasks: StateSelector<RequestTaskState, ItemDTO[]> = createAggregateSelector(
  (state) => state?.relatedTasks,
  selectRequestTask,
  (relatedTasks, requestTask) =>
    relatedTasks?.filter((t) => {
      return t.taskId !== requestTask.id;
    }) ?? [],
);

const selectTimeline: StateSelector<RequestTaskState, RequestActionInfoDTO[]> = createSelector((state) =>
  produce(state?.timeline, (timeline) =>
    timeline.sort((a, b) => (isBefore(new Date(a.creationDate), new Date(b.creationDate)) ? 1 : -1)),
  ),
);

const selectFinalDocumentsGenerationInProgress: StateSelector<RequestTaskState, boolean | null> =
  createDescendingSelector(selectRequestTaskPayload, (state) => (state as any)?.finalDocumentsGenerationInProgress);

const selectFinalDocumentsGenerationSuccessful: StateSelector<RequestTaskState, boolean | null> =
  createDescendingSelector(selectRequestTaskPayload, (state) => (state as any)?.finalDocumentsGenerationSuccessful);

const selectPreviewFiles: StateSelector<
  RequestTaskState,
  {
    [key: string]: RequestTaskPreviewFileInfoDTO;
  }
> = createDescendingSelector(
  selectRequestTaskPayload,
  (state) => (state as any)?.previewFiles as { [key: string]: RequestTaskPreviewFileInfoDTO },
);

const selectTaskReassignedTo: StateSelector<RequestTaskState, string> = pipe((state) => state?.taskReassignedTo);

const selectIsEditable: StateSelector<RequestTaskState, boolean> = createSelector((state) => state.isEditable);

const selectMetadata: StateSelector<RequestTaskState, { [key: string]: unknown }> = createSelector((state) => {
  return state.metadata;
});

const selectTasksDownloadUrl: StateSelector<RequestTaskState, string> = createDescendingSelector(
  selectRequestTaskId,
  (taskId) => `/tasks/${taskId}/file-download/`,
);

export const requestTaskQuery = {
  selectRequestTaskItem,
  selectAllowedRequestTaskActions,
  selectRequestInfo,
  selectRequestId,
  selectRequestType,
  selectRequestMetadata,
  selectRequestTask,
  selectRequestTaskId,
  selectRequestTaskPayload,
  selectUserAssignCapable,
  selectIsAssignable,
  selectIsAssignActionVisible,
  selectAssigneeUserId,
  selectAssigneeFullName,
  selectRequestTaskType,
  selectRelatedTasks,
  selectRelatedActions,
  selectTimeline,
  selectFinalDocumentsGenerationInProgress,
  selectFinalDocumentsGenerationSuccessful,
  selectPreviewFiles,
  selectTaskReassignedTo,
  selectIsEditable,
  selectMetadata,
  selectTasksDownloadUrl,
  selectRequestTaskAccountId,
  selectRequestTaskCompetentAuthority,
};
