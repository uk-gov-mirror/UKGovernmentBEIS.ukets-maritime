import { RelatedActionsMap } from '@netz/common/components';

import {
  AER_VERIFICATION_RETURN_TO_OPERATOR_ROUTE,
  AER_VERIFICATION_SUBMIT_ROUTE_PREFIX,
} from '@requests/common/aer/aer.consts';
import { isCancelActionAvailable } from '@requests/common/is-cancel-action-available';
import { NON_COMPLIANCE_AMEND_DETAILS_ROUTE_PREFIX } from '@requests/common/non-compliance/non-compliance-amend-details';
import { NON_COMPLIANCE_CLOSE_ROUTE_PREFIX } from '@requests/common/non-compliance/non-compliance-close';
import { PROVIDE_NOTE_REDIRECT_ROUTE_PREFIX } from '@requests/common/provide-note-redirect';
import { CREATE_ACTION_TYPE } from '@requests/common/types';

export const relatedActionsMap: RelatedActionsMap = {
  ACCOUNT_CLOSURE_CANCEL_APPLICATION: { text: 'Cancel application', path: ['cancel'] },
  EMP_NOTIFICATION_CANCEL_APPLICATION: { text: 'Cancel this task', path: ['cancel'] },
  EMP_ISSUANCE_RECALL_FROM_AMENDS: { text: 'Recall the application', path: ['recall'] },
  EMP_VARIATION_RECALL_FROM_AMENDS: { text: 'Recall the variation', path: ['recall'] },
  EMP_NOTIFICATION_FOLLOW_UP_RECALL_FROM_AMENDS: { text: 'Recall your response', path: ['recall'] },
  EMP_VARIATION_CANCEL_APPLICATION: { text: 'Cancel task', path: ['cancel'] },
  RFI_SUBMIT: { text: 'Request for information', path: ['rfi', 'submit'] },
  RDE_SUBMIT: { text: 'Request deadline extension', path: ['rde', 'submit'] },
  CANCEL_APPLICATION: {
    text: 'Cancel request',
    path: ({ requestTaskType }) => (isCancelActionAvailable(requestTaskType) ? ['cancel'] : undefined),
  },
  DOE_CANCEL_APPLICATION: { text: 'Cancel task', path: ['cancel'] },
  EMP_ISSUANCE_SEND_REGISTRY_ACCOUNT_OPENING_EVENT: { text: 'Integration with Registry', path: ['registry', 'submit'] },
  AER_RECALL_FROM_VERIFICATION: { text: 'Recall report from verifier', path: ['recall'] },
  AER_VERIFICATION_RETURN_TO_OPERATOR: {
    text: 'Return to operator for changes',
    path: [AER_VERIFICATION_SUBMIT_ROUTE_PREFIX, AER_VERIFICATION_RETURN_TO_OPERATOR_ROUTE],
  },
  DOE: { text: 'Determine maritime emissions', path: ['create-action', `${CREATE_ACTION_TYPE.DOE}`] },
  AER_SKIP_REVIEW: { text: 'Skip review and complete report', path: ['aer-review', 'skip-review'] },
  AER: {
    text: 'Return to operator for changes',
    path: ['create-action', `${CREATE_ACTION_TYPE.AER}`],
  },
  NON_COMPLIANCE_CLOSE_APPLICATION: { text: 'Close task', path: [NON_COMPLIANCE_CLOSE_ROUTE_PREFIX] },
  NON_COMPLIANCE_FINAL_DETERMINATION_SAVE_APPLICATION: {
    text: 'Provide note on appeal',
    path: [PROVIDE_NOTE_REDIRECT_ROUTE_PREFIX],
  },
  NON_COMPLIANCE_AMEND_DETAILS: {
    text: 'Change the details of non-compliance',
    path: [NON_COMPLIANCE_AMEND_DETAILS_ROUTE_PREFIX],
  },
  SITE_VISIT_CANCEL_APPLICATION: { text: 'Cancel this task', path: ['cancel'] },
  SITE_VISIT_RECALL_FROM_AMENDS: { text: 'Recall Site Visit', path: ['recall'] },
  EMP_ISSUANCE_IMPORT_THETIS_XML: { text: 'Import EU XML if you have a single ship', path: ['eu-xml-import'] },
};
