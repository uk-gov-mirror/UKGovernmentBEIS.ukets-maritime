import { Service } from '@angular/core';

import { produce } from 'immer';

import { SignalStore } from '@netz/common/store';

import {
  initialState,
  SiteContactsFilters,
  SiteContactsState,
} from '@regulators/site-contacts/+store/site-contacts.state';

@Service()
export class SiteContactsStore extends SignalStore<SiteContactsState> {
  constructor() {
    super(initialState);
  }

  setPage(page: number) {
    this.setState(
      produce(this.state, (state) => {
        state.paging = { ...state.paging, page };
      }),
    );
  }

  setFilters(filters: SiteContactsFilters) {
    this.setState(
      produce(this.state, (state) => {
        state.filters = filters;
      }),
    );
  }
}
