import { Service } from '@angular/core';

import { TermsDTO } from '@mrtm/api';

import { Store } from '@core/store';
import { initialState } from '@core/store/latest-terms/latest-terms.state';

@Service()
export class LatestTermsStore extends Store<TermsDTO> {
  constructor() {
    super(initialState);
  }

  setLatestTerms(latestTerms: TermsDTO) {
    this.setState(latestTerms);
  }
}
