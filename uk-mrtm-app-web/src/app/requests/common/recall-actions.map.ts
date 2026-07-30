import { RequestTaskActionProcessDTO } from '@mrtm/api';

export const recallActionsMap: Record<
  string,
  {
    actionType: RequestTaskActionProcessDTO['requestTaskActionType'];
    caption: string;
    text?: string;
    buttonText?: string;
    recallType: 'EMP' | 'EMP_VARIATION' | 'NOTIFICATION' | 'AER' | 'SITE_VISIT';
    successMessage: string;
  }
> = {
  EMP_ISSUANCE_WAIT_FOR_AMENDS: {
    actionType: 'EMP_ISSUANCE_RECALL_FROM_AMENDS',
    caption: 'Are you sure you want to recall the application?',
    text: 'Any changes the operator made will be lost.',
    buttonText: 'Yes, recall the application',
    recallType: 'EMP',
    successMessage: 'Application recalled from the operator',
  },
  EMP_VARIATION_WAIT_FOR_AMENDS: {
    actionType: 'EMP_VARIATION_RECALL_FROM_AMENDS',
    caption: 'Are you sure you want to recall the emission monitoring plan variation?',
    text: 'Any changes the operator made will be lost.',
    buttonText: 'Yes, recall the application',
    recallType: 'EMP_VARIATION',
    successMessage: 'Variation recalled from the operator',
  },
  EMP_NOTIFICATION_FOLLOW_UP_WAIT_FOR_AMENDS: {
    actionType: 'EMP_NOTIFICATION_FOLLOW_UP_RECALL_FROM_AMENDS',
    caption: 'Are you sure you want to recall yor response?',
    buttonText: 'Yes, recall your response',
    recallType: 'NOTIFICATION',
    successMessage: 'Your response has been recalled',
  },
  AER_WAIT_FOR_VERIFICATION: {
    actionType: 'AER_RECALL_FROM_VERIFICATION',
    caption: 'Are you sure you want to recall the report from verifier?',
    text: 'Any progress the verifier has made will be saved.',
    buttonText: 'Yes, recall the report',
    recallType: 'AER',
    successMessage: 'Report recalled from the verifier',
  },
  AER_AMEND_WAIT_FOR_VERIFICATION: {
    actionType: 'AER_RECALL_FROM_VERIFICATION',
    caption: 'Are you sure you want to recall the report from verifier?',
    text: 'Any progress the verifier has made will be saved.',
    buttonText: 'Yes, recall the report',
    recallType: 'AER',
    successMessage: 'Report recalled from the verifier',
  },
  SITE_VISIT_WAIT_FOR_AMENDS: {
    actionType: 'SITE_VISIT_RECALL_FROM_AMENDS',
    caption: 'Are you sure you want to recall the application?',
    text: 'Any changes the operator made will be lost.',
    buttonText: 'Yes, recall the application',
    recallType: 'SITE_VISIT',
    successMessage: 'Application recalled from the operator',
  },
};
