import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { waitForFollowUpQuery } from '@requests/tasks/notification-wait-for-follow-up/+state';
import { FollowUpRequestSummaryTemplateComponent } from '@shared/components/summaries/follow-up-request-summary-template';
import { FollowUpRequest } from '@shared/types/follow-up-request.interface';

@Component({
  selector: 'mrtm-notification-wait-for-follow-up',
  imports: [FollowUpRequestSummaryTemplateComponent],
  standalone: true,
  templateUrl: './notification-wait-for-follow-up.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationWaitForFollowUpComponent {
  private readonly store = inject(RequestTaskStore);
  readonly changeLink = 'wait-for-follow-up/edit-due-date';

  readonly followUpRequest: FollowUpRequest = {
    request: this.store.select(waitForFollowUpQuery.selectPayload)().followUpRequest,
    dueDate: this.store.select(waitForFollowUpQuery.selectPayload)().followUpResponseExpirationDate,
  };

  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable)();
}
