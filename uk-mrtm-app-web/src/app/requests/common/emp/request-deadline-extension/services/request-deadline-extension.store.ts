import { Service } from '@angular/core';

import { RdePayload } from '@mrtm/api';

import { SignalStore } from '@netz/common/store';

import {
  RequestNotificationModel,
  RequestNotificationService,
} from '@requests/common/emp/components/request-notification-form/request-notification-form.types';
import { EmpRdeTaskPayload } from '@requests/common/emp/request-deadline-extension/request-deadline-extension.types';

@Service()
export class RequestDeadlineExtensionStore
  extends SignalStore<EmpRdeTaskPayload>
  implements RequestNotificationService
{
  constructor() {
    super({} as EmpRdeTaskPayload);
  }

  public setNotification(payload: RequestNotificationModel): void {
    this.setState({
      ...this.state,
      rdePayload: {
        ...this.state?.rdePayload,
        ...payload,
      },
    });
  }

  public setRde(payload: RdePayload): void {
    this.setState({
      ...this.state,
      rdePayload: {
        ...this.state.rdePayload,
        ...payload,
      },
    });
  }
}
