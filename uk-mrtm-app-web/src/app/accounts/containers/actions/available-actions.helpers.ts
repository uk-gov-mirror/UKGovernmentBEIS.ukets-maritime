import { MrtmRequestType } from '@shared/types';

export const AVAILABLE_ACTIONS_MAP: Record<MrtmRequestType, { path: string; title: string }> = {
  SITE_VISIT: { path: 'site-visits', title: 'Site visits' },
};
