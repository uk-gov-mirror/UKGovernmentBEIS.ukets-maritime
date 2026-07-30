import { createDescendingSelector, createSelector, StateSelector } from '@netz/common/store';

import { SiteContactsFilters, SiteContactsState } from '@regulators/site-contacts/+store/site-contacts.state';
import { Paging } from '@shared/types';

export const selectFilters: StateSelector<SiteContactsState, SiteContactsFilters> = createSelector(
  (state) => state.filters,
);

export const selectPaging: StateSelector<SiteContactsState, Paging> = createSelector((state) => state.paging);

export const selectPage: StateSelector<SiteContactsState, number> = createDescendingSelector(
  selectPaging,
  (state) => state.page,
);

export const selectPageSize: StateSelector<SiteContactsState, number> = createDescendingSelector(
  selectPaging,
  (state) => state.pageSize,
);
