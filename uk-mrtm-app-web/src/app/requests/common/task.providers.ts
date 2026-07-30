import { Provider } from '@angular/core';

import { RequestTaskDTO } from '@mrtm/api';

import { CANCEL_ACTION_SUCCESS_COMPONENT, CANCEL_ACTIONS_MAP } from '@netz/common/cancel-task';
import {
  TASK_RELATED_ACTIONS_MAP,
  TASK_RELATED_PREVIEW_ASYNC_DOCUMENTS_MAP,
  TASK_RELATED_PREVIEW_DOCUMENTS_MAP,
} from '@netz/common/components';
import {
  DAYS_REMAINING_INPUT_TRANSFORMER,
  ITEM_ACTION_TRANSFORMER,
  ITEM_ACTIONS_MAP,
  ITEM_LINK_REQUEST_TYPES_WHITELIST,
  ITEM_NAME_TRANSFORMER,
  TASK_STATUS_TAG_MAP,
} from '@netz/common/pipes';
import { REQUEST_TASK_IS_EDITABLE_RESOLVER } from '@netz/common/request-task';
import { ITEM_TYPE_TO_RETURN_TEXT_MAPPER, RequestTaskStore, TYPE_AWARE_STORE } from '@netz/common/store';

import { cancelActionsMap } from '@requests/common/cancel-actions.map';
import { EmpVariationCancelSuccessComponent } from '@requests/common/components';
import { RfiRdeCancelSuccessComponent } from '@requests/common/components/rfi-rde-cancel-success';
import { isEditableTaskResolver } from '@requests/common/is-editable-task-resolver.map';
import { itemActionsMap } from '@requests/common/item-actions.map';
import { relatedActionsMap } from '@requests/common/related-actions.map';
import { taskRelatedPreviewAsyncDocumentsMapFactory } from '@requests/common/related-preview-async-documents-map.factory';
import { taskRelatedPreviewDocumentsMapFactory } from '@requests/common/related-preview-documents-map.factory';
import { statusTagMap } from '@requests/common/status-tag.map';
import { requestTypesWhitelistForItemLinkPipe } from '@shared/constants';
import {
  daysRemainingTransformer,
  itemActionToTitleTransformer,
  taskActionTypeToTitleTransformer,
} from '@shared/utils';

const taskTypeToReturnText = (type: RequestTaskDTO['type'], year?: string | number): string => {
  return taskActionTypeToTitleTransformer(type, year) ?? 'Dashboard';
};

export const taskProviders: Provider[] = [
  { provide: TYPE_AWARE_STORE, useExisting: RequestTaskStore },
  { provide: ITEM_TYPE_TO_RETURN_TEXT_MAPPER, useValue: taskTypeToReturnText },
  { provide: REQUEST_TASK_IS_EDITABLE_RESOLVER, useValue: isEditableTaskResolver },
  { provide: TASK_RELATED_ACTIONS_MAP, useValue: relatedActionsMap },
  {
    provide: TASK_RELATED_PREVIEW_DOCUMENTS_MAP,
    deps: [RequestTaskStore],
    useFactory: taskRelatedPreviewDocumentsMapFactory,
  },
  {
    provide: TASK_RELATED_PREVIEW_ASYNC_DOCUMENTS_MAP,
    deps: [RequestTaskStore],
    useFactory: taskRelatedPreviewAsyncDocumentsMapFactory,
  },
  { provide: TASK_STATUS_TAG_MAP, useValue: statusTagMap },
  { provide: CANCEL_ACTIONS_MAP, useValue: cancelActionsMap },
  {
    provide: CANCEL_ACTION_SUCCESS_COMPONENT,
    useValue: {
      EMP_ISSUANCE_WAIT_FOR_RFI_RESPONSE: RfiRdeCancelSuccessComponent,
      EMP_VARIATION_WAIT_FOR_RFI_RESPONSE: RfiRdeCancelSuccessComponent,
      EMP_NOTIFICATION_WAIT_FOR_RFI_RESPONSE: RfiRdeCancelSuccessComponent,
      EMP_VARIATION_APPLICATION_SUBMIT: EmpVariationCancelSuccessComponent,
      EMP_VARIATION_REGULATOR_LED_APPLICATION_SUBMIT: EmpVariationCancelSuccessComponent,
    },
  },

  { provide: ITEM_ACTIONS_MAP, useValue: itemActionsMap },
  { provide: ITEM_ACTION_TRANSFORMER, useValue: itemActionToTitleTransformer },
  { provide: ITEM_NAME_TRANSFORMER, useValue: taskActionTypeToTitleTransformer },
  { provide: ITEM_LINK_REQUEST_TYPES_WHITELIST, useValue: requestTypesWhitelistForItemLinkPipe },
  { provide: DAYS_REMAINING_INPUT_TRANSFORMER, useValue: daysRemainingTransformer },
];
