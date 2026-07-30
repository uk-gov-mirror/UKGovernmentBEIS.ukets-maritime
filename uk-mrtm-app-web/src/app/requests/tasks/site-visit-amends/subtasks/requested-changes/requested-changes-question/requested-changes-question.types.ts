import { FormControl } from '@angular/forms';

export interface RequestedChangesUserInput {
  accepted: boolean;
}

export type RequestedChangesQuestionFormModel = Record<keyof RequestedChangesUserInput, FormControl>;
