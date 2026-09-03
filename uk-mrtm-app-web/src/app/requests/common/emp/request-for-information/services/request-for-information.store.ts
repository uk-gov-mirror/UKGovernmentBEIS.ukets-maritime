import { Service } from '@angular/core';

import { RfiSubmitPayload } from '@mrtm/api';

import { SignalStore } from '@netz/common/store';

import {
  RequestNotificationModel,
  RequestNotificationService,
} from '@requests/common/emp/components/request-notification-form/request-notification-form.types';
import { EmpRfiTaskPayload } from '@requests/common/emp/request-for-information/request-for-information.types';
import { UploadedFile } from '@shared/types';
import { transformToTaskAttachments } from '@shared/utils';

@Service()
export class RequestForInformationStore
  extends SignalStore<EmpRfiTaskPayload & { rfiAttachments?: { [key: string]: string } }>
  implements RequestNotificationService
{
  constructor() {
    super({} as EmpRfiTaskPayload);
  }

  public setNotification(payload: RequestNotificationModel): void {
    this.setState({
      ...this.state,
      rfiSubmitPayload: {
        ...this.state?.rfiSubmitPayload,
        ...payload,
      },
    });
  }

  public setRfi(payload: RfiSubmitPayload): void {
    this.setState({
      ...this.state,
      rfiSubmitPayload: {
        ...this.state.rfiSubmitPayload,
        ...payload,
      },
      rfiAttachments: {
        ...this.state?.rfiAttachments,
        ...transformToTaskAttachments(payload?.files as unknown as UploadedFile[]),
      },
    });
  }
}
