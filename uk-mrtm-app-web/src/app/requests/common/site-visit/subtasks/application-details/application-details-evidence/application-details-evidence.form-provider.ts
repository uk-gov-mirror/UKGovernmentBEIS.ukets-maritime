import { Provider } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { SiteVisitApplicationDetails } from '@mrtm/api';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { GovukValidators } from '@netz/govuk-components';

import { siteVisitCommonQuery } from '@requests/common/site-visit/+state';
import { APPLICATION_DETAILS_SUBTASK } from '@requests/common/site-visit/subtasks/application-details';
import { ApplicationDetailsEvidenceFormGroupModel } from '@requests/common/site-visit/subtasks/application-details/application-details-evidence/application-details-evidence.types';
import { TASK_FORM } from '@requests/common/task-form.token';
import { taskActionTypeToUploadSectionTaskActionTypeMap } from '@shared/constants/upload-attachment-request-task-action-type.map';
import { RequestTaskFileService } from '@shared/services';

export const provideEvidenceRequestTypeForm: Provider = {
  provide: TASK_FORM,
  deps: [FormBuilder, RequestTaskStore, RequestTaskFileService],
  useFactory: (
    fb: FormBuilder,
    store: RequestTaskStore,
    fileService: RequestTaskFileService,
  ): FormGroup<ApplicationDetailsEvidenceFormGroupModel> => {
    const requestTaskId = store.select(requestTaskQuery.selectRequestTaskId)();
    const requestTaskType = store.select(requestTaskQuery.selectRequestTaskType)();
    const isEditable = store.select(requestTaskQuery.selectIsEditable)();
    const attachments = store.select(siteVisitCommonQuery.selectAttachments)();
    const subtask = store.select(siteVisitCommonQuery.selectSubtask(APPLICATION_DETAILS_SUBTASK))();

    return fb.group({
      files: fileService.buildFormControl(
        requestTaskId,
        subtask?.files ?? [],
        attachments,
        taskActionTypeToUploadSectionTaskActionTypeMap?.[requestTaskType],
        true,
        !isEditable,
        'Upload supporting files',
      ),
      clarification: fb.control<SiteVisitApplicationDetails['clarification'] | null>(subtask?.clarification, {
        validators: [GovukValidators.maxLength(10000, 'Enter up to 10000 characters')],
      }),
    });
  },
};
