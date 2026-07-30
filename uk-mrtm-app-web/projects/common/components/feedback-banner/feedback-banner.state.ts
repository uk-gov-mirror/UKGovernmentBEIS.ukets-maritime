import { FormGroup, NgForm } from '@angular/forms';

export interface NeutralBanner {
  heading: string;
  body: string;
}

export interface FeedbackBannerState {
  type: 'success' | 'error' | 'neutral' | null;
  successMessages: string[];
  invalidForm: NgForm | FormGroup | null;
  neutralBanner: NeutralBanner | null;
}

export const initialFeedbackBannerState: FeedbackBannerState = {
  type: null,
  successMessages: [],
  invalidForm: null,
  neutralBanner: null,
};
