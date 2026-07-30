import { createSelector, StateSelector } from '@netz/common/store';

import { FeedbackBannerState } from './feedback-banner.state';

export const selectType: StateSelector<FeedbackBannerState, FeedbackBannerState['type']> = createSelector(
  (state) => state.type,
);

export const selectSuccessMessages: StateSelector<FeedbackBannerState, FeedbackBannerState['successMessages']> =
  createSelector((state) => state.successMessages);

export const selectInvalidForm: StateSelector<FeedbackBannerState, FeedbackBannerState['invalidForm']> = createSelector(
  (state) => state.invalidForm,
);

export const selectNeutralBanner: StateSelector<FeedbackBannerState, FeedbackBannerState['neutralBanner']> =
  createSelector((state) => state.neutralBanner);
