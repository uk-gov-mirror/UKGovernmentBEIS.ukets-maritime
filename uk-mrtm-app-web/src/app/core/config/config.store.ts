import { Service } from '@angular/core';

import { ConfigState, initialState } from '@core/config/config.state';
import { Store } from '@core/store';

@Service()
export class ConfigStore extends Store<ConfigState> {
  constructor() {
    super(initialState);
  }
}
