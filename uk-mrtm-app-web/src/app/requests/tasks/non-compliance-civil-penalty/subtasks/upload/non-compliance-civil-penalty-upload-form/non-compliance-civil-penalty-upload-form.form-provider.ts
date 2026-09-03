import { Provider } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { NonComplianceCivilPenaltyRequestTaskPayload } from '@mrtm/api';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { GovukValidators } from '@netz/govuk-components';

import { nonComplianceCommonQuery } from '@requests/common/non-compliance/+state';
import { nonComplianceCivilPenaltyCommonQuery } from '@requests/common/non-compliance/non-compliance-civil-penalty/+state';
import { TASK_FORM } from '@requests/common/task-form.token';
import { taskActionTypeToUploadSectionTaskActionTypeMap } from '@shared/constants/upload-attachment-request-task-action-type.map';
import { RequestTaskFileService } from '@shared/services';
import { isNil } from '@shared/utils';
import { futureDateValidator } from '@shared/validators';

export const nonComplianceCivilPenaltyUploadFormProvider: Provider = {
  provide: TASK_FORM,
  deps: [FormBuilder, RequestTaskStore, RequestTaskFileService],
  useFactory: (formBuilder: FormBuilder, store: RequestTaskStore, fileService: RequestTaskFileService) => {
    const nonComplianceCivilPenaltyUpload = store.select(
      nonComplianceCivilPenaltyCommonQuery.selectNonComplianceCivilPenaltyUpload,
    )();
    const nonComplianceAttachments = store.select(nonComplianceCommonQuery.selectNonComplianceAttachments)();
    const isEditable = store.select(nonComplianceCivilPenaltyCommonQuery.selectIsFormEditable)();
    const requestTaskId = store.select(requestTaskQuery.selectRequestTaskId)();
    const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();

    return formBuilder.group({
      civilPenalty: fileService.buildFormControl(
        requestTaskId,
        nonComplianceCivilPenaltyUpload?.civilPenalty ?? null,
        nonComplianceAttachments,
        taskActionTypeToUploadSectionTaskActionTypeMap?.[requestTaskType],
        true,
        !isEditable,
      ),
      penaltyAmount: formBuilder.control<NonComplianceCivilPenaltyRequestTaskPayload['penaltyAmount']>(
        nonComplianceCivilPenaltyUpload?.penaltyAmount ?? null,
        [
          GovukValidators.required('Enter the final penalty amount'),
          GovukValidators.min(0, 'Enter a positive number up to 2 decimal places'),
          GovukValidators.notNaN('Enter a numerical value'),
          GovukValidators.maxDecimalsValidator(2),
        ],
      ),
      dueDate: formBuilder.control<Date>(
        !isNil(nonComplianceCivilPenaltyUpload?.dueDate) ? new Date(nonComplianceCivilPenaltyUpload?.dueDate) : null,
        [
          GovukValidators.required('Enter the date by which the penalty must be paid'),
          futureDateValidator('The penalty payment due date'),
        ],
      ),
      comments: formBuilder.control<NonComplianceCivilPenaltyRequestTaskPayload['comments']>(
        nonComplianceCivilPenaltyUpload?.comments ?? null,
        [GovukValidators.maxLength(10000, 'Enter up to 10000 characters')],
      ),
    });
  },
};
