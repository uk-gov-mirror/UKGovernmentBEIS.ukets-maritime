import { PeerReviewDecisionRequestTaskActionPayload, SiteVisitApplicationReviewRequestTaskPayload } from '@mrtm/api';

import {
  createAggregateSelector,
  createDescendingSelector,
  requestTaskQuery,
  RequestTaskState,
  StateSelector,
} from '@netz/common/store';

const selectPayload: StateSelector<RequestTaskState, SiteVisitApplicationReviewRequestTaskPayload> =
  createDescendingSelector(
    requestTaskQuery.selectRequestTaskPayload,
    (payload) => payload as SiteVisitApplicationReviewRequestTaskPayload,
  );

const selectPeerReviewPayload: StateSelector<RequestTaskState, PeerReviewDecisionRequestTaskActionPayload> =
  createDescendingSelector(
    requestTaskQuery.selectRequestTaskPayload,
    (payload) => payload as PeerReviewDecisionRequestTaskActionPayload,
  );

const selectReviewDecision = createDescendingSelector(selectPayload, (payload) => payload?.reviewDecision);

const selectReviewAttachments = createDescendingSelector(selectPayload, (payload) => payload?.reviewAttachments);

const selectReviewDecisionDTO = createAggregateSelector(
  requestTaskQuery.selectTasksDownloadUrl,
  selectReviewAttachments,
  selectReviewDecision,
  (tasksDownloadUrl, reviewAttachments, reviewGroupDecision) => ({
    type: reviewGroupDecision?.type,
    details: {
      requiredChanges: (reviewGroupDecision?.details as any)?.requiredChanges?.map((change) => ({
        reason: change?.reason,
        files:
          change?.files?.map((id) => ({
            downloadUrl: tasksDownloadUrl + `${id}`,
            fileName: reviewAttachments[id],
          })) ?? [],
      })),
      notes: reviewGroupDecision?.details?.notes,
      summary: (reviewGroupDecision?.details as any)?.summary,
    },
  }),
);

export const selectPeerReviewDecision = createDescendingSelector(
  selectPeerReviewPayload,
  (payload) => payload?.decision,
);

export const siteVisitReviewQuery = {
  selectPayload,
  selectReviewDecision,
  selectReviewAttachments,
  selectReviewDecisionDTO,
  selectPeerReviewDecision,
};
