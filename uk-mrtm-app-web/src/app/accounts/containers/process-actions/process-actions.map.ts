import { UserStateDTO } from '@mrtm/api';

import { WorkflowMap } from '@accounts/containers/process-actions/process-actions.types';
import { MrtmRequestType } from '@shared/types';

export const processActionsDetailsTypesMap: Record<MrtmRequestType, string> = {
  ACCOUNT_CLOSURE: 'account closure',
  EMP_VARIATION: 'emission plan variation',
  EMP_NOTIFICATION: 'notification',
  NON_COMPLIANCE: 'non-compliance',
  SITE_VISIT: 'site visit',
};

const operatorsWorkflowMessagesMap: WorkflowMap = {
  EMP_VARIATION: {
    title: 'Make a change to your emissions monitoring plan',
    button: 'Start an emission plan variation',
  },
  SITE_VISIT: {
    title: 'Apply for a virtual site visit',
    button: 'Start application',
    routerLink: ['./', 'site-visits'],
  },
};

const regulatorsWorkflowMessagesMap: WorkflowMap = {
  ACCOUNT_CLOSURE: {
    title: 'Close this account',
    button: 'Start to close this account',
  },
  EMP_VARIATION: {
    title: 'Make a change to the emissions monitoring plan',
    button: 'Start an emission plan variation',
  },
  NON_COMPLIANCE: {
    title: 'Start a non-compliance task',
    button: 'Start a non-compliance task',
  },
};

export const userRoleWorkflowsMap: Record<UserStateDTO['roleType'], WorkflowMap> = {
  OPERATOR: operatorsWorkflowMessagesMap,
  REGULATOR: regulatorsWorkflowMessagesMap,
  VERIFIER: undefined,
  SECTOR_USER: undefined,
};
