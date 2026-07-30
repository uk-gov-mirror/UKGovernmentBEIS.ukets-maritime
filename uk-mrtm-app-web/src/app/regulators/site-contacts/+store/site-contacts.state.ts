import { AccountSearchResultInfoDTO } from '@mrtm/api';

import { AutocompleteSelectOption } from '@shared/components';
import { Paging } from '@shared/types';

export interface SiteContactsFilters {
  businessId?: AutocompleteSelectOption<AccountSearchResultInfoDTO['businessId']>;
}

export interface SiteContactsState {
  filters: SiteContactsFilters;
  paging: Paging;
}

export const initialSiteContactsFiltersState: SiteContactsFilters = {
  businessId: null,
};

export const initialState: SiteContactsState = {
  filters: initialSiteContactsFiltersState,
  paging: {
    page: 1,
    pageSize: 20,
  },
};
