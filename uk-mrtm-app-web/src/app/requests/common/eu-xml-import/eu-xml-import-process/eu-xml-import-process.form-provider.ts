import { Provider } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';

import { RequestTaskStore } from '@netz/common/store';

import { TASK_FORM } from '@requests/common/task-form.token';
import { FileType } from '@shared/constants';
import { RequestTaskFileService } from '@shared/services';
import {
  emptyFileValidator,
  fileExtensionValidator,
  fileNameLengthValidator,
  maxFileSizeValidator,
} from '@shared/validators';

export const euXmlImportFormProvider: Provider = {
  provide: TASK_FORM,
  deps: [UntypedFormBuilder, RequestTaskStore, RequestTaskFileService],
  useFactory: (fb: UntypedFormBuilder) =>
    fb.group({
      file: fb.control(null, {
        updateOn: 'change',
        validators: [
          fileExtensionValidator(['xml'], FileType.XML, 'The selected file must be an XML'),
          maxFileSizeValidator(20, 'The selected file must be smaller than 20MB'),
          fileNameLengthValidator(100, 'The selected file must have a file name length less than 100 characters'),
          emptyFileValidator('The selected file cannot be empty'),
        ],
      }),
    }),
};
