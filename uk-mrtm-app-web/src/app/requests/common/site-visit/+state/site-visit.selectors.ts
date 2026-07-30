import { SiteVisitRequestMetadata } from '@mrtm/api';

import {
  createAggregateSelector,
  createDescendingSelector,
  requestTaskQuery,
  RequestTaskState,
  StateSelector,
} from '@netz/common/store';

import { SiteVisitCommonTaskPayload } from '@requests/common/site-visit/site-visit-common.types';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { SiteVisitApplicationDetailsDto } from '@shared/types';

const SITE_VISIT_SUBTASK: Array<keyof SiteVisitCommonTaskPayload['siteVisit']> = ['applicationDetails'];

const selectPayload: StateSelector<RequestTaskState, SiteVisitCommonTaskPayload> = createDescendingSelector(
  requestTaskQuery.selectRequestTaskPayload,
  (payload) => payload as SiteVisitCommonTaskPayload,
);

const selectMetadata: StateSelector<RequestTaskState, SiteVisitRequestMetadata> = createDescendingSelector(
  requestTaskQuery.selectRequestInfo,
  (metadata) => metadata?.requestMetadata as SiteVisitRequestMetadata,
);

const selectSectionsCompleted: StateSelector<RequestTaskState, SiteVisitCommonTaskPayload['sectionsCompleted']> =
  createDescendingSelector(selectPayload, (payload) => payload?.sectionsCompleted);

const selectYear: StateSelector<RequestTaskState, SiteVisitRequestMetadata['year']> = createDescendingSelector(
  selectMetadata,
  (metadata) => metadata?.year,
);

const allSectionsCompleted: StateSelector<RequestTaskState, boolean> = createDescendingSelector(
  selectSectionsCompleted,
  (sectionsCompleted) => {
    for (const section of SITE_VISIT_SUBTASK) {
      if (sectionsCompleted?.[section] !== TaskItemStatus.COMPLETED) {
        return false;
      }
    }

    return true;
  },
);

const selectStatusForSubtask = (
  subtask: keyof SiteVisitCommonTaskPayload['sectionsCompleted'] | string,
  defaultStatus: TaskItemStatus = TaskItemStatus.NOT_STARTED,
) =>
  createDescendingSelector(
    selectSectionsCompleted,
    (sectionsCompleted) => (sectionsCompleted[subtask] ?? defaultStatus) as TaskItemStatus,
  );

const selectAttachments: StateSelector<RequestTaskState, SiteVisitCommonTaskPayload['siteVisitAttachments']> =
  createDescendingSelector(selectPayload, (payload) => payload?.siteVisitAttachments);

const selectSubtask = (subtask: keyof SiteVisitCommonTaskPayload['siteVisit']) =>
  createDescendingSelector(selectPayload, (payload) => payload?.siteVisit?.[subtask]);

const selectSiteVisitSummary: StateSelector<RequestTaskState, SiteVisitApplicationDetailsDto> = createAggregateSelector(
  requestTaskQuery.selectTasksDownloadUrl,
  selectPayload,
  (downloadUrl, payload) => {
    const { siteVisit, year, siteVisitAttachments } = payload ?? {};

    return {
      ...(siteVisit?.applicationDetails ?? {}),
      reportingYear: year,
      files: (siteVisit?.applicationDetails?.files ?? []).map((file) => ({
        downloadUrl: downloadUrl + file,
        fileName: siteVisitAttachments?.[file],
      })),
    };
  },
);

export const siteVisitCommonQuery = {
  selectPayload,
  selectSectionsCompleted,
  selectYear,
  selectStatusForSubtask,
  allSectionsCompleted,
  selectAttachments,
  selectSubtask,
  selectSiteVisitSummary,
};
