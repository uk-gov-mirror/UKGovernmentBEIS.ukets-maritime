import { computed } from '@angular/core';

import { EmpNotificationReviewDecision } from '@mrtm/api';

import { RelatedPreviewDocumentsMap } from '@netz/common/components';
import { RequestTaskStore } from '@netz/common/store';

import { nocReviewQuery } from '@requests/common/emp/+state/noc-review.selectors';
import { siteVisitReviewQuery } from '@requests/tasks/site-visit-review/+store';

const nocReviewPreviewDocumentTypesMap: Record<EmpNotificationReviewDecision['type'], string> = {
  ACCEPTED: 'EMP_NOTIFICATION_ACCEPTED',
  REJECTED: 'EMP_NOTIFICATION_REFUSED',
};

export const taskRelatedPreviewDocumentsMapFactory = (store: RequestTaskStore): RelatedPreviewDocumentsMap =>
  computed(() => {
    const nocReviewDecision = store.select(nocReviewQuery.selectReviewDecision)();
    const hasNocReviewDecision = !!nocReviewDecision?.type;
    const empNotificationPreviewDocuments = [
      {
        filename: 'letter_preview.pdf',
        documentType: nocReviewPreviewDocumentTypesMap[nocReviewDecision?.type],
        visibleInRelatedActions: hasNocReviewDecision,
        visibleInNotify: true,
      },
    ];
    const doeSubmitPreviewDocuments = (isPeerReview: boolean) => [
      {
        filename: 'letter_preview.pdf',
        documentType: 'DOE_SUBMITTED',
        visibleInRelatedActions: isPeerReview,
        visibleInNotify: true,
      },
    ];

    const virApplicationReviewPreviewDocuments = [
      {
        filename: 'letter_preview.pdf',
        documentType: 'VIR_REVIEWED',
        visibleInRelatedActions: false,
        visibleInNotify: true,
      },
    ];

    const siteVisitApplicationPreviewDocuments = (isPeerReview: boolean) => [
      {
        filename: 'Virtual_site_visit_letter.pdf',
        documentType:
          store.select(siteVisitReviewQuery.selectReviewDecisionDTO)()?.type === 'ACCEPTED'
            ? 'SITE_VISIT_APPROVED'
            : 'SITE_VISIT_REJECTED',
        visibleInRelatedActions:
          isPeerReview ||
          ['ACCEPTED', 'REJECTED'].includes(store.select(siteVisitReviewQuery.selectReviewDecisionDTO)()?.type),
        visibleInNotify: true,
      },
    ];

    return {
      EMP_NOTIFICATION_APPLICATION_REVIEW: empNotificationPreviewDocuments,
      EMP_NOTIFICATION_APPLICATION_PEER_REVIEW: empNotificationPreviewDocuments,
      EMP_NOTIFICATION_WAIT_FOR_PEER_REVIEW: empNotificationPreviewDocuments,
      DOE_APPLICATION_SUBMIT: doeSubmitPreviewDocuments(false),
      DOE_APPLICATION_PEER_REVIEW: doeSubmitPreviewDocuments(true),
      VIR_APPLICATION_REVIEW: virApplicationReviewPreviewDocuments,
      SITE_VISIT_APPLICATION_REVIEW: siteVisitApplicationPreviewDocuments(false),
      SITE_VISIT_WAIT_FOR_PEER_REVIEW: siteVisitApplicationPreviewDocuments(false),
      SITE_VISIT_APPLICATION_PEER_REVIEW: siteVisitApplicationPreviewDocuments(true),
    };
  });
