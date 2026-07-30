import { MrtmRequestStatus } from '@shared/types';

export const reportStatusMap: Record<MrtmRequestStatus, string> = {
  // Values must be in alphabetical order
  APPROVED: 'Approved',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  EXEMPT: 'Exempt',
  IN_PROGRESS: 'In progress',
  REJECTED: 'Rejected',
};
