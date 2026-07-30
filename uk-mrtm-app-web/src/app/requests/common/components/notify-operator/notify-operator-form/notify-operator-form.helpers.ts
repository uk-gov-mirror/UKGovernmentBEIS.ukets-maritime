import { RequestTaskDTO } from '@mrtm/api';

import { NotifyOperatorConfig } from '@requests/common/components/notify-operator/notify-operator-types';

const EMP_TASKS = [
  'EMP_ISSUANCE_APPLICATION_REVIEW',
  'EMP_VARIATION_APPLICATION_REVIEW',
  'EMP_VARIATION_REGULATOR_LED_APPLICATION_SUBMIT',
];
const DOE_TASKS = ['DOE_APPLICATION_SUBMIT'];
const VIR_TASKS = ['VIR_APPLICATION_REVIEW'];
const NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_TASKS = ['NON_COMPLIANCE_INITIAL_PENALTY_NOTICE'];
const NON_COMPLIANCE_NOTICE_OF_INTENT_TASKS = ['NON_COMPLIANCE_NOTICE_OF_INTENT'];
const NON_COMPLIANCE_CIVIL_PENALTY_TASKS = ['NON_COMPLIANCE_CIVIL_PENALTY'];
const SITE_VISIT_TASKS = ['SITE_VISIT_APPLICATION_REVIEW'];

export const getNotifyOperatorConfigByRequestType = (requestType: RequestTaskDTO['type']): NotifyOperatorConfig => {
  if ([...EMP_TASKS, ...DOE_TASKS].includes(requestType)) {
    return {
      header: 'Select who should receive documents',
      usersHeader: 'Users that automatically receive documents',
      otherUsersHeader: 'Select other users',
      externalContactsHeader: 'Select the external contacts',
      hasSignatoryField: true,
      signatoryHeader: 'Select the name and signature that will be shown on the documents',
    };
  }

  if (VIR_TASKS.includes(requestType)) {
    return {
      header: 'Select who should receive improvements letter',
      usersHeader: 'Users that automatically receive documents',
      otherUsersHeader: 'Select other users',
      externalContactsHeader: 'Select the external contacts',
      hasSignatoryField: true,
      signatoryHeader: 'Select the name and signature that will be shown on the letter',
    };
  }

  if (NON_COMPLIANCE_INITIAL_PENALTY_NOTICE_TASKS.includes(requestType)) {
    return {
      header: 'Select who should receive the initial penalty notice',
      usersHeader: 'Users that automatically receive the initial penalty notice',
      otherUsersHeader: 'Select other users',
      externalContactsHeader: 'Select the external contacts',
      hasSignatoryField: false,
      signatoryHeader: '',
    };
  }

  if (NON_COMPLIANCE_NOTICE_OF_INTENT_TASKS.includes(requestType)) {
    return {
      header: 'Select who should receive the notice of intent',
      usersHeader: 'Users that automatically receive the notice of intent',
      otherUsersHeader: 'Select other users',
      externalContactsHeader: 'Select the external contacts',
      hasSignatoryField: false,
      signatoryHeader: '',
    };
  }

  if (NON_COMPLIANCE_CIVIL_PENALTY_TASKS.includes(requestType)) {
    return {
      header: 'Select who should receive the civil penalty notice',
      usersHeader: 'Users that automatically receive the civil penalty notice',
      otherUsersHeader: 'Select other users',
      externalContactsHeader: 'Select the external contacts',
      hasSignatoryField: false,
      signatoryHeader: '',
    };
  }

  if (SITE_VISIT_TASKS.includes(requestType)) {
    return {
      header: 'Select who should receive the letter',
      usersHeader: 'Users automatically notified',
      otherUsersHeader: 'Select any additional users you want to notify',
      externalContactsHeader: 'Select the external contacts you want to notify',
      hasSignatoryField: true,
      signatoryHeader: 'Select the name and signature that will be shown on the letter',
    };
  }

  return {
    header: 'Select who should receive the notification letter',
    usersHeader: 'Users automatically notified',
    otherUsersHeader: 'Select any additional users you want to notify',
    externalContactsHeader: 'Select the external contacts you want to notify',
    hasSignatoryField: true,
    signatoryHeader: 'Select the name and signature that will be shown on the notification letter',
  };
};
