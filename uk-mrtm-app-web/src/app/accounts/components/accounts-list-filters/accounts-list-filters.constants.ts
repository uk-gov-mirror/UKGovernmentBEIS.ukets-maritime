import { MrtmAccountViewDTO } from '@mrtm/api';

import { GovukSelectOption } from '@netz/govuk-components';

export const ACCOUNTS_STATUS_SELECT_OPTIONS: Array<GovukSelectOption<MrtmAccountViewDTO['status']>> = [
  {
    value: null,
    text: 'All',
  },
  {
    value: 'CLOSED',
    text: 'Closed',
  },
  {
    value: 'LIVE',
    text: 'Live',
  },
  {
    value: 'NEW',
    text: 'New',
  },
  {
    value: 'WITHDRAWN',
    text: 'Withdrawn',
  },
];
