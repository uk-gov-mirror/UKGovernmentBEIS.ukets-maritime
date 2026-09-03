import { Service } from '@angular/core';

import { produce } from 'immer';

import { RequestActionDTO, RequestActionPayload } from '@mrtm/api';

import { SignalStore } from '../signal-store';
import { initialRequestActionState, RequestActionState } from './request-action.state';

@Service()
export class RequestActionStore extends SignalStore<RequestActionState> {
  constructor() {
    super(initialRequestActionState);
  }

  setAction(action: RequestActionDTO) {
    this.setState(
      produce(this.state, (state) => {
        state.action = action;
      }),
    );
  }

  setSubmitter(submitter: string) {
    this.setState(
      produce(this.state, (state) => {
        state.action.submitter = submitter;
      }),
    );
  }

  setType(type: RequestActionDTO['type']) {
    this.setState(
      produce(this.state, (state) => {
        state.action.type = type;
      }),
    );
  }

  setPayload(payload: RequestActionPayload) {
    this.setState(
      produce(this.state, (state) => {
        state.action.payload = payload;
      }),
    );
  }
}
