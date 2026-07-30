import {
  AuthorityManagePermissionDTO,
  RegulatorUserDTO,
  RegulatorUsersAuthoritiesInfoDTO,
  UserStateDTO,
} from '@mrtm/api';

export const mockRegulatorsRouteData: { regulators: RegulatorUsersAuthoritiesInfoDTO } = {
  regulators: {
    caUsers: [
      {
        userId: '1reg',
        firstName: 'Alfyn',
        lastName: 'Octo',
        authorityStatus: 'DISABLED',
        authorityCreationDate: '2020-12-14T12:38:12.846716Z',
      },
      {
        userId: '2reg',
        firstName: 'Therion',
        lastName: 'Path',
        authorityStatus: 'ACTIVE',
        authorityCreationDate: '2020-12-15T12:38:12.846716Z',
      },
      {
        userId: '3reg',
        firstName: 'Olberik',
        lastName: 'Traveler',
        authorityStatus: 'ACTIVE',
        authorityCreationDate: '2020-11-10T12:38:12.846716Z',
      },
      {
        userId: '4reg',
        firstName: 'andrew',
        lastName: 'webber',
        authorityStatus: 'ACTIVE',
        authorityCreationDate: '2021-01-10T12:38:12.846716Z',
      },
      {
        userId: '5reg',
        firstName: 'William',
        lastName: 'Walker',
        authorityStatus: 'PENDING',
        authorityCreationDate: '2021-02-8T12:38:12.846716Z',
      },
    ],
    editable: true,
  },
};

export const mockRegulatorUserStatus: UserStateDTO = {
  status: 'ENABLED',
  roleType: 'REGULATOR',
  userId: '111',
};

export const mockRegulatorUser: {
  user: RegulatorUserDTO;
  permissions: AuthorityManagePermissionDTO;
} = {
  user: {
    email: 'test@host.com',
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'developer',
    phoneNumber: '23456',
    mobileNumber: '55444',
    signature: {
      name: 'SampleSignature.bmp',
      uuid: '9e53c099-9165-4967-beb5-0076e1fc5505',
    },
  },
  permissions: {
    editable: true,
    permissions: {
      ACCOUNT_CLOSURE: 'EXECUTE',
      ADD_OPERATOR_ADMIN: 'NONE',
      ANNUAL_IMPROVEMENT_REPORT: 'NONE',
      ASSIGN_REASSIGN_TASKS: 'NONE',
      MANAGE_GUIDANCE: 'NONE',
      MANAGE_THIRD_PARTY_DATA_PROVIDERS: 'NONE',
      MANAGE_USERS_AND_CONTACTS: 'VIEW_ONLY',
      MANAGE_VERIFICATION_BODIES: 'VIEW_ONLY',
      PEER_REVIEW_DOE: 'VIEW_ONLY',
      PEER_REVIEW_EMP_APPLICATION: 'VIEW_ONLY',
      PEER_REVIEW_EMP_NOTIFICATION: 'VIEW_ONLY',
      PEER_REVIEW_EMP_VARIATION: 'VIEW_ONLY',
      PEER_REVIEW_NON_COMPLIANCE: 'VIEW_ONLY',
      PEER_REVIEW_SITE_VISIT: 'NONE',
      REVIEW_AER: 'VIEW_ONLY',
      REVIEW_EMP_APPLICATION: 'VIEW_ONLY',
      REVIEW_EMP_NOTIFICATION: 'VIEW_ONLY',
      REVIEW_SITE_VISIT: 'NONE',
      REVIEW_VIR: 'VIEW_ONLY',
      SUBMIT_DOE: 'VIEW_ONLY',
      SUBMIT_NON_COMPLIANCE: 'VIEW_ONLY',
      SUBMIT_EMP_BATCH_REISSUE: 'VIEW_ONLY',
      SUBMIT_REVIEW_EMP_VARIATION: 'VIEW_ONLY',
    },
  },
};

export const mockRegulatorRolePermissions = [
  'ACCOUNT_CLOSURE',
  'ADD_OPERATOR_ADMIN',
  'ANNUAL_IMPROVEMENT_REPORT',
  'ASSIGN_REASSIGN_TASKS',
  'MANAGE_USERS_AND_CONTACTS',
  'MANAGE_VERIFICATION_BODIES',
  'PEER_REVIEW_DOE',
  'PEER_REVIEW_EMP_APPLICATION',
  'PEER_REVIEW_EMP_NOTIFICATION',
  'PEER_REVIEW_EMP_VARIATION',
  'PEER_REVIEW_NON_COMPLIANCE',
  'REVIEW_AER',
  'REVIEW_EMP_APPLICATION',
  'REVIEW_EMP_NOTIFICATION',
  'REVIEW_VIR',
  'SUBMIT_DOE',
  'SUBMIT_NON_COMPLIANCE',
  'SUBMIT_EMP_BATCH_REISSUE',
  'SUBMIT_REVIEW_EMP_VARIATION',
];

const COMMON_ROLE_PERMISSIONS = {
  ACCOUNT_CLOSURE: 'EXECUTE',
  ADD_OPERATOR_ADMIN: 'EXECUTE',
  ANNUAL_IMPROVEMENT_REPORT: 'EXECUTE',
  ASSIGN_REASSIGN_TASKS: 'EXECUTE',
  MANAGE_USERS_AND_CONTACTS: 'EXECUTE',
  MANAGE_VERIFICATION_BODIES: 'EXECUTE',
  PEER_REVIEW_DOE: 'EXECUTE',
  PEER_REVIEW_EMP_APPLICATION: 'EXECUTE',
  PEER_REVIEW_EMP_NOTIFICATION: 'EXECUTE',
  PEER_REVIEW_EMP_VARIATION: 'EXECUTE',
  PEER_REVIEW_NON_COMPLIANCE: 'EXECUTE',
  REVIEW_AER: 'EXECUTE',
  REVIEW_EMP_APPLICATION: 'EXECUTE',
  REVIEW_EMP_NOTIFICATION: 'EXECUTE',
  REVIEW_VIR: 'EXECUTE',
  SUBMIT_DOE: 'EXECUTE',
  SUBMIT_NON_COMPLIANCE: 'EXECUTE',
  SUBMIT_EMP_BATCH_REISSUE: 'EXECUTE',
  SUBMIT_REVIEW_EMP_VARIATION: 'EXECUTE',
};

export const mockRegulatorBasePermissions = [
  {
    name: 'Regulator admin team',
    code: 'regulator_admin_team',
    rolePermissions: {
      ...COMMON_ROLE_PERMISSIONS,
      ACCOUNT_CLOSURE: 'VIEW_ONLY',
      ADD_OPERATOR_ADMIN: 'NONE',
      ANNUAL_IMPROVEMENT_REPORT: 'VIEW_ONLY',
      MANAGE_USERS_AND_CONTACTS: 'NONE',
      MANAGE_VERIFICATION_BODIES: 'NONE',
      PEER_REVIEW_DOE: 'VIEW_ONLY',
      PEER_REVIEW_EMP_APPLICATION: 'VIEW_ONLY',
      PEER_REVIEW_EMP_NOTIFICATION: 'VIEW_ONLY',
      PEER_REVIEW_EMP_VARIATION: 'VIEW_ONLY',
      PEER_REVIEW_NON_COMPLIANCE: 'VIEW_ONLY',
      REVIEW_AER: 'VIEW_ONLY',
      REVIEW_EMP_APPLICATION: 'VIEW_ONLY',
      REVIEW_EMP_NOTIFICATION: 'VIEW_ONLY',
      REVIEW_VIR: 'VIEW_ONLY',
      SUBMIT_DOE: 'VIEW_ONLY',
      SUBMIT_NON_COMPLIANCE: 'VIEW_ONLY',
      SUBMIT_EMP_BATCH_REISSUE: 'NONE',
      SUBMIT_REVIEW_EMP_VARIATION: 'VIEW_ONLY',
    },
  },
  {
    name: 'Regulator team leader',
    code: 'regulator_team_leader',
    rolePermissions: {
      ...COMMON_ROLE_PERMISSIONS,
      ADD_OPERATOR_ADMIN: 'NONE',
      MANAGE_USERS_AND_CONTACTS: 'NONE',
      MANAGE_VERIFICATION_BODIES: 'NONE',
      SUBMIT_EMP_BATCH_REISSUE: 'VIEW_ONLY',
    },
  },
  {
    name: 'CA super user',
    code: 'ca_super_user',
    rolePermissions: {
      ...COMMON_ROLE_PERMISSIONS,
    },
  },
  {
    name: 'Service super user',
    code: 'service_super_user',
    rolePermissions: {
      ...COMMON_ROLE_PERMISSIONS,
    },
  },
  {
    name: 'Regulator technical officer',
    code: 'regulator_technical_officer',
    rolePermissions: {
      ...COMMON_ROLE_PERMISSIONS,
      ADD_OPERATOR_ADMIN: 'NONE',
      MANAGE_USERS_AND_CONTACTS: 'NONE',
      MANAGE_VERIFICATION_BODIES: 'NONE',
      SUBMIT_EMP_BATCH_REISSUE: 'VIEW_ONLY',
    },
  },
];

export const mockRegulatorPermissionGroups = {
  ACCOUNT_CLOSURE: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  ADD_OPERATOR_ADMIN: ['NONE', 'EXECUTE'],
  ANNUAL_IMPROVEMENT_REPORT: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  ASSIGN_REASSIGN_TASKS: ['NONE', 'EXECUTE'],
  MANAGE_USERS_AND_CONTACTS: ['NONE', 'EXECUTE'],
  MANAGE_VERIFICATION_BODIES: ['NONE', 'EXECUTE'],
  PEER_REVIEW_DOE: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  PEER_REVIEW_EMP_APPLICATION: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  PEER_REVIEW_EMP_NOTIFICATION: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  PEER_REVIEW_EMP_VARIATION: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  PEER_REVIEW_NON_COMPLIANCE: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  REVIEW_AER: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  REVIEW_EMP_APPLICATION: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  REVIEW_EMP_NOTIFICATION: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  REVIEW_VIR: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  SUBMIT_DOE: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  SUBMIT_NON_COMPLIANCE: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  SUBMIT_EMP_BATCH_REISSUE: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
  SUBMIT_REVIEW_EMP_VARIATION: ['NONE', 'VIEW_ONLY', 'EXECUTE'],
};
