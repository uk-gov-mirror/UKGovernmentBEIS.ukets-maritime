import { FormControl, UntypedFormControl } from '@angular/forms';

import { SiteVisitApplicationDetails } from '@mrtm/api';

import { UploadedFile } from '@shared/types';

export interface ApplicationDetailsEvidenceModel extends Omit<SiteVisitApplicationDetails, 'files'> {
  files: Array<UploadedFile>;
}

export interface ApplicationDetailsEvidenceFormGroupModel {
  files: UntypedFormControl;
  clarification: FormControl;
}
