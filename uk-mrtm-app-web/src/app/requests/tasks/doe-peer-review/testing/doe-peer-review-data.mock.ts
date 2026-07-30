import { produce } from 'immer';

import { DoeMaritimeEmissions } from '@mrtm/api';

import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskState } from '@netz/common/store';

import { TaskItemStatus } from '@requests/common/task-item-status';
import { DoePeerReviewRequestTaskPayload } from '@requests/tasks/doe-peer-review/doe-peer-review.types';
import { DoeTaskPayload } from '@requests/tasks/doe-submit/doe-submit.types';

export const mockDoePeerReviewMaritimeEmissions: DoeMaritimeEmissions = {
  determinationReason: {
    details: {
      type: 'CORRECTING_NON_MATERIAL_MISSTATEMENT',
      noticeText: 'test notice text',
    },
    furtherDetails: 'test further details',
  },
  totalMaritimeEmissions: {
    determinationType: 'MARITIME_EMISSIONS',
    totalReportableEmissions: '1',
    lessVoyagesInNorthernIrelandDeduction: '2',
    surrenderEmissions: '12',
    calculationApproach: 'test another data source',
    supportingDocuments: ['11111111-1111-4111-a111-111111111111'],
  },
  chargeOperator: true,
  feeDetails: {
    totalBillableHours: '100',
    hourlyRate: '56.23',
    dueDate: new Date('2050-10-31') as unknown as string,
    comments: 'test regulator comments',
  },
};

export const mockDoeSubmitSubmitRequestTask = {
  ...mockRequestTask,
  isEditable: false,
  requestTaskItem: {
    ...mockRequestTask.requestTaskItem,
    requestTask: {
      ...mockRequestTask.requestTaskItem.requestTask,
      payload: {
        payloadType: 'DOE_SUBMIT_PEER_REVIEW_DECISION_PAYLOAD',
        doe: {},
        doeAttachments: {},
        sectionsCompleted: {},
        sendEmailNotification: true,
      } as DoeTaskPayload,
    },
  },
};

export const mockStateBuild = (
  data?: Partial<Record<keyof DoePeerReviewRequestTaskPayload['doe'], any>>,
  taskStatus?: Partial<Record<keyof DoePeerReviewRequestTaskPayload['doe'], TaskItemStatus>>,
  attachments?: DoePeerReviewRequestTaskPayload['doeAttachments'],
): RequestTaskState => ({
  ...mockDoeSubmitSubmitRequestTask,
  requestTaskItem: produce(mockDoeSubmitSubmitRequestTask.requestTaskItem, (requestTaskItem) => {
    const payload = requestTaskItem.requestTask.payload as DoeTaskPayload;

    payload.doe = { ...payload.doe, ...data };
    payload.sectionsCompleted = { ...payload.sectionsCompleted, ...taskStatus };
    payload.doeAttachments = { ...payload.doeAttachments, ...attachments };
  }),
});
