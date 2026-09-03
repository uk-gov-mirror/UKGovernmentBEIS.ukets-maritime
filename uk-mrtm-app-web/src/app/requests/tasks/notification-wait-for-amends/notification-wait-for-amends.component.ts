import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { WarningTextComponent } from '@netz/govuk-components';

import { waitForAmendsQuery } from '@requests/tasks/notification-wait-for-amends/+state';
import { FollowUpResponseAndDecisionSummaryTemplateComponent } from '@shared/components';
import { FollowUpAmends } from '@shared/types/follow-up-amends.interface';

@Component({
  selector: 'mrtm-notification-wait-for-amends',
  imports: [WarningTextComponent, FollowUpResponseAndDecisionSummaryTemplateComponent],
  standalone: true,
  templateUrl: './notification-wait-for-amends.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationWaitForAmendsComponent {
  private readonly store = inject(RequestTaskStore);
  readonly changeLink = 'wait-for-amends/edit-due-date';

  readonly followUpAmends: FollowUpAmends = {
    followUpReviewDecision: this.store.select(waitForAmendsQuery.selectFollowUpReviewDecisionDTO)(),
    followUpResponse: {
      response: this.store.select(waitForAmendsQuery.selectPayload)().followUpResponse,
      request: this.store.select(waitForAmendsQuery.selectPayload)().followUpRequest,
      attachments: this.store.select(
        waitForAmendsQuery.selectAttachedFiles(this.store.select(waitForAmendsQuery.selectFollowUpFiles)()),
      )(),
    },
  };

  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable)();
}
