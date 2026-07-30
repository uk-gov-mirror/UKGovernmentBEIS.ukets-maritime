import { RequestInfoDTO } from '@mrtm/api';

export type MrtmRequestType =
  | RequestInfoDTO['type']
  | 'ACCOUNT_CLOSURE'
  | 'AER'
  | 'EMP_ISSUANCE'
  | 'EMP_NOTIFICATION'
  | 'EMP_VARIATION'
  | 'EMP_REISSUE'
  | 'EMP_BATCH_REISSUE'
  | 'DOE'
  | 'VIR'
  | 'NON_COMPLIANCE'
  | 'SITE_VISIT';
