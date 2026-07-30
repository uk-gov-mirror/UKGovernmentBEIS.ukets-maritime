import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { produce } from 'immer';

import { SignalStore } from '@netz/common/store';

import { FeedbackBannerState, initialFeedbackBannerState } from './feedback-banner.state';

@Injectable({ providedIn: 'root' })
export class FeedbackBannerStore extends SignalStore<FeedbackBannerState> {
  constructor() {
    super(initialFeedbackBannerState);
  }

  setSuccessMessages(messages: FeedbackBannerState['successMessages']) {
    this.setState(
      produce(this.state, (state) => {
        state.successMessages = messages;
        state.type = 'success';
      }),
    );
  }

  setNeutralBanner(banner: FeedbackBannerState['neutralBanner']) {
    this.setState(
      produce(this.state, (state) => {
        state.neutralBanner = banner;
        state.type = 'neutral';
      }),
    );
  }

  setInvalidFormLive(form: FeedbackBannerState['invalidForm']) {
    this.setState(
      produce(this.state, (state) => {
        state.invalidForm = form;
        state.type = 'error';
      }),
    );
  }

  setInvalidForm(form: FeedbackBannerState['invalidForm']) {
    // Create a new form to contain the form errors. This is done to detach the errors being displayed in the banner
    // from the form, which is being edited in real time. Also, only the errors are copied over to the new form to
    // optimize performance.
    const errorForm = new FormGroup({});
    errorForm.setErrors(form?.errors);
    this.setState(
      produce(this.state, (state) => {
        state.invalidForm = errorForm;
        state.type = 'error';
      }),
    );
  }

  reset(): void {
    this.setState(initialFeedbackBannerState);
  }
}
