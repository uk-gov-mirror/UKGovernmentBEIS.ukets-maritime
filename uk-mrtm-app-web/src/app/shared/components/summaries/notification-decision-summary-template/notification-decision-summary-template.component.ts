import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

import { DecisionNotification } from '@mrtm/api';

import { AuthStore, selectUserRoleType } from '@netz/common/auth';
import { GovukDatePipe } from '@netz/common/pipes';
import {
  LinkDirective,
  SummaryListComponent,
  SummaryListRowActionsDirective,
  SummaryListRowDirective,
  SummaryListRowKeyDirective,
  SummaryListRowValueDirective,
} from '@netz/govuk-components';

import { SummaryDownloadFilesComponent } from '@shared/components/summary-download-files/summary-download-files.component';
import { NotProvidedDirective } from '@shared/directives';
import { BooleanToTextPipe, ReviewDecisionTypePipe, UserInfoResolverPipe } from '@shared/pipes';
import { AttachedFile, NotificationReviewDecisionUnion, NotifyAccountOperatorUsersInfo } from '@shared/types';

@Component({
  selector: 'mrtm-notification-decision-summary-template',
  imports: [
    GovukDatePipe,
    SummaryDownloadFilesComponent,
    SummaryListComponent,
    SummaryListRowDirective,
    SummaryListRowKeyDirective,
    SummaryListRowValueDirective,
    LinkDirective,
    SummaryListRowActionsDirective,
    RouterLink,
    NotProvidedDirective,
    ReviewDecisionTypePipe,
    BooleanToTextPipe,
    UserInfoResolverPipe,
  ],
  standalone: true,
  templateUrl: './notification-decision-summary-template.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationDecisionSummaryTemplateComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  readonly reviewDecision = input.required<NotificationReviewDecisionUnion>();
  readonly usersInfo = input.required<NotifyAccountOperatorUsersInfo>();
  readonly reviewDecisionNotification = input.required<DecisionNotification>();
  readonly officialNotice = input.required<AttachedFile>();
  readonly changeLink = input<string>();
  readonly isEditable = input(false);
  readonly queryParams = input<Params>({});
  recipientIds: string[] = [];

  public readonly userRole = this.authStore.select(selectUserRoleType);

  ngOnInit(): void {
    this.recipientIds = Object.keys(this.usersInfo()).filter(
      (userId) => userId !== this.reviewDecisionNotification().signatory,
    );
  }
}
