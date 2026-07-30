import { SiteVisitApplicationReviewSubmittedRequestActionPayload } from '@mrtm/api';

import { createAggregateSelector } from '@netz/common/store';

import { timelineCommonQuery } from '@requests/common';

const selectSiteVisitReviewSubmittedSummary = createAggregateSelector(
  timelineCommonQuery.selectPayload<SiteVisitApplicationReviewSubmittedRequestActionPayload>(),
  timelineCommonQuery.selectReportingYear,
  timelineCommonQuery.selectDownloadUrl,
  (payload, reportingYear, downloadUrl) => {
    const { siteVisit, siteVisitAttachments, reviewAttachments, reviewDecision } = payload;

    return {
      details: {
        ...siteVisit.applicationDetails,
        reportingYear: +(reportingYear ?? 0),
        files: (siteVisit?.applicationDetails?.files ?? []).map((file) => ({
          downloadUrl: downloadUrl + file,
          fileName: siteVisitAttachments?.[file],
        })),
      },
      reviewDecision: {
        type: reviewDecision?.type,
        details: {
          requiredChanges: (reviewDecision?.details as any)?.requiredChanges?.map((change) => ({
            reason: change?.reason,
            files:
              change?.files?.map((id) => ({
                downloadUrl: downloadUrl + `${id}`,
                fileName: reviewAttachments[id],
              })) ?? [],
          })),
          notes: reviewDecision?.details?.notes,
          summary: (reviewDecision?.details as any)?.summary,
        },
      },
    };
  },
);

export const siteVisitReviewedQuery = {
  selectSiteVisitReviewSubmittedSummary,
};
