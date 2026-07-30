import { computed } from '@angular/core';

import { PreviewAsyncDocument, RelatedPreviewAsyncDocumentsMap } from '@netz/common/components';
import { RequestTaskStore } from '@netz/common/store';

import { empVariationQuery } from '@requests/common/emp';
import { empReviewQuery } from '@requests/common/emp/+state/emp-review.selectors';
import { empVariationReviewQuery } from '@requests/common/emp/+state/emp-variation-review.selectors';
import { TaskItemStatus } from '@requests/common/task-item-status';

export const taskRelatedPreviewAsyncDocumentsMapFactory = (store: RequestTaskStore): RelatedPreviewAsyncDocumentsMap =>
  computed(() => {
    const empReviewDetermination = store.select(empReviewQuery.selectDetermination)();
    const hasEmpReviewTermination = !!empReviewDetermination?.type;
    const empVariationReviewDetermination = store.select(empVariationReviewQuery.selectDetermination)();
    const hasEmpVariationReviewDetermination = !!empVariationReviewDetermination?.type;
    const isVariationDetailsCompleted =
      store.select(empVariationQuery.selectStatusForEmpVariationDetailsSubtask)() === TaskItemStatus.COMPLETED;

    const empIssuancePreviewDocuments: PreviewAsyncDocument[] = [
      {
        requestGeneratedFileType: 'OFFICIAL_NOTICE',
        requestPayloadType: 'EMP_ISSUANCE_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD',
        requestTaskActionType: 'EMP_ISSUANCE_REVIEW_PREVIEW_OFFICIAL_DOCUMENT',
        labelText: 'Create letter preview file',
        loadingText: 'Creating letter preview file',
        displayedFileName: 'Letter_preview.pdf',
        visibleInRelatedActions: hasEmpReviewTermination,
        visibleInNotify: true,
      },
      {
        requestGeneratedFileType: 'EMP',
        requestPayloadType: 'EMP_ISSUANCE_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD',
        requestTaskActionType: 'EMP_ISSUANCE_REVIEW_PREVIEW_EMP_DOCUMENT',
        labelText: 'Create emissions monitoring plan file',
        loadingText: 'Creating emissions monitoring plan file',
        displayedFileName: 'emissions_monitoring_plan_preview.pdf',
        visibleInRelatedActions: true,
        visibleInNotify: empReviewDetermination?.type === 'APPROVED',
      },
    ];

    const empVariationPreviewDocuments: PreviewAsyncDocument[] = [
      {
        requestGeneratedFileType: 'OFFICIAL_NOTICE',
        requestPayloadType: 'EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD',
        requestTaskActionType: 'EMP_VARIATION_REVIEW_PREVIEW_OFFICIAL_DOCUMENT',
        labelText: 'Create letter preview file',
        loadingText: 'Creating letter preview file',
        displayedFileName: 'Letter_preview.pdf',
        visibleInRelatedActions: hasEmpVariationReviewDetermination,
        visibleInNotify: true,
      },
      {
        requestGeneratedFileType: 'EMP',
        requestPayloadType: 'EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD',
        requestTaskActionType: 'EMP_VARIATION_REVIEW_PREVIEW_EMP_DOCUMENT',
        labelText: 'Create emissions monitoring plan file',
        loadingText: 'Creating emissions monitoring plan file',
        displayedFileName: 'emissions_monitoring_plan_preview.pdf',
        visibleInRelatedActions: true,
        visibleInNotify: empVariationReviewDetermination?.type === 'APPROVED',
      },
    ];

    const empVariationRegulatorLedPreviewDocuments: PreviewAsyncDocument[] = [
      {
        requestGeneratedFileType: 'OFFICIAL_NOTICE',
        requestPayloadType: 'EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD',
        requestTaskActionType: 'EMP_VARIATION_SUBMIT_REGULATOR_LED_PREVIEW_OFFICIAL_DOCUMENT',
        labelText: 'Create letter preview file',
        loadingText: 'Creating letter preview file',
        displayedFileName: 'Letter_preview.pdf',
        visibleInRelatedActions: isVariationDetailsCompleted,
        visibleInNotify: isVariationDetailsCompleted,
      },
      {
        requestGeneratedFileType: 'EMP',
        requestPayloadType: 'EMP_VARIATION_NOTIFY_OPERATOR_FOR_DECISION_PAYLOAD',
        requestTaskActionType: 'EMP_VARIATION_SUBMIT_REGULATOR_LED_PREVIEW_EMP_DOCUMENT',
        labelText: 'Create emissions monitoring plan file',
        loadingText: 'Creating emissions monitoring plan file',
        displayedFileName: 'emissions_monitoring_plan_preview.pdf',
        visibleInRelatedActions: true,
        visibleInNotify: true,
      },
    ];

    return {
      EMP_ISSUANCE_APPLICATION_REVIEW: empIssuancePreviewDocuments,
      EMP_ISSUANCE_APPLICATION_PEER_REVIEW: empIssuancePreviewDocuments,
      EMP_ISSUANCE_WAIT_FOR_PEER_REVIEW: empIssuancePreviewDocuments,
      EMP_ISSUANCE_WAIT_FOR_AMENDS: empIssuancePreviewDocuments,
      EMP_VARIATION_APPLICATION_REVIEW: empVariationPreviewDocuments,
      EMP_VARIATION_APPLICATION_PEER_REVIEW: empVariationPreviewDocuments,
      EMP_VARIATION_WAIT_FOR_PEER_REVIEW: empVariationPreviewDocuments,
      EMP_VARIATION_WAIT_FOR_AMENDS: empVariationPreviewDocuments,
      EMP_VARIATION_REGULATOR_LED_APPLICATION_SUBMIT: empVariationRegulatorLedPreviewDocuments,
      EMP_VARIATION_REGULATOR_LED_APPLICATION_PEER_REVIEW: empVariationRegulatorLedPreviewDocuments,
      EMP_VARIATION_REGULATOR_LED_WAIT_FOR_PEER_REVIEW: empVariationRegulatorLedPreviewDocuments,
    };
  });
