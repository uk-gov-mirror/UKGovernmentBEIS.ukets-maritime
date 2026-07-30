import {
  createAggregateSelector,
  createDescendingSelector,
  RequestActionState,
  StateSelector,
} from '@netz/common/store';

import { timelineCommonQuery, timelineUtils } from '@requests/common';
import { SiteVisitReturnedForAmendsPayload } from '@requests/timeline/site-visit-returned-for-amends/site-visit-returned-for-amends.types';

const selectPayload: StateSelector<RequestActionState, SiteVisitReturnedForAmendsPayload> =
  timelineCommonQuery.selectPayload<SiteVisitReturnedForAmendsPayload>();

const selectAmendsAttachments: StateSelector<
  RequestActionState,
  SiteVisitReturnedForAmendsPayload['reviewAttachments']
> = createDescendingSelector(selectPayload, (payload) => payload.reviewAttachments);

const selectAmendsDecisionsDTO = createAggregateSelector(
  selectAmendsAttachments,
  timelineCommonQuery.selectDownloadUrl,
  selectPayload,
  (attachments, downloadUrl, payload) => {
    const reviewGroupDecision = payload?.reviewDecision;

    return {
      type: reviewGroupDecision?.type,
      details: {
        requiredChanges: (reviewGroupDecision?.details as any)?.requiredChanges?.map((change) => ({
          reason: change?.reason,
          files: timelineUtils.getAttachedFiles(change?.files, attachments, downloadUrl),
        })),
        notes: reviewGroupDecision?.details?.notes,
      },
    };
  },
);

export const siteVisitReturnedForAmendsQuery = {
  selectAmendsDecisionsDTO,
};
