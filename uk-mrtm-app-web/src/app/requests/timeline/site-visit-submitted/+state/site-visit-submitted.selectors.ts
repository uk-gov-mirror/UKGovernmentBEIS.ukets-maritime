import { SiteVisitApplicationSubmittedRequestActionPayload } from '@mrtm/api';

import { createAggregateSelector, RequestActionState, StateSelector } from '@netz/common/store';

import { timelineCommonQuery } from '@requests/common';
import { SiteVisitApplicationDetailsDto } from '@shared/types';

const selectSiteVisitSummary: StateSelector<RequestActionState, SiteVisitApplicationDetailsDto> =
  createAggregateSelector(
    timelineCommonQuery.selectDownloadUrl,
    timelineCommonQuery.selectReportingYear,
    timelineCommonQuery.selectPayload<SiteVisitApplicationSubmittedRequestActionPayload>(),
    (downloadUrl, reportingYear, payload) => {
      const { siteVisit, siteVisitAttachments } = payload;

      return {
        ...siteVisit.applicationDetails,
        reportingYear: +(reportingYear ?? 0),
        files: (siteVisit?.applicationDetails?.files ?? []).map((file) => ({
          downloadUrl: downloadUrl + file,
          fileName: siteVisitAttachments?.[file],
        })),
      };
    },
  );

export const siteVisitSubmittedQuery = {
  selectSiteVisitSummary,
};
