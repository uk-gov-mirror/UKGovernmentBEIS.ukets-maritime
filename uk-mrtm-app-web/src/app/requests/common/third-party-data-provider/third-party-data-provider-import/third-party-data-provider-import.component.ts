import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs';

import { FeedbackBannerStore, PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { GovukDatePipe } from '@netz/common/pipes';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import {
  ButtonDirective,
  SummaryListComponent,
  SummaryListRowDirective,
  SummaryListRowKeyDirective,
  SummaryListRowValueDirective,
  WarningTextComponent,
} from '@netz/govuk-components';

import { TaskItemStatus } from '@requests/common';
import { IThirdPartyDataProviderService } from '@requests/common/services';
import {
  thirdPartyDataProviderQuery,
  ThirdPartyDataProviderStore,
} from '@requests/common/third-party-data-provider/+state';
import {
  EXTRA_DETAILS,
  EXTRA_WARNING,
  IMPORT_THIRD_PARTY_DATA_PROVIDER_SUB_TASK,
  SECTIONS_COMPLETED_SELECTOR,
  SUBTASKS_AFFECTED_BY_IMPORT,
  SUCCESS_MESSAGES,
} from '@requests/common/third-party-data-provider/third-party-data-provider.const';
import { isAer, isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-third-party-data-provider-import',
  imports: [
    ButtonDirective,
    GovukDatePipe,
    PageHeadingComponent,
    ReturnToTaskOrActionPageComponent,
    SummaryListComponent,
    SummaryListRowDirective,
    SummaryListRowKeyDirective,
    SummaryListRowValueDirective,
    WarningTextComponent,
  ],
  standalone: true,
  templateUrl: './third-party-data-provider-import.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThirdPartyDataProviderImportComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly store = inject(RequestTaskStore);
  private readonly sectionsCompletedSelector = inject(SECTIONS_COMPLETED_SELECTOR);
  private readonly service = inject(TaskService) as IThirdPartyDataProviderService<unknown>;
  private readonly thirdPartyDataProviderStore = inject(ThirdPartyDataProviderStore);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly affectedSubtasks = inject(SUBTASKS_AFFECTED_BY_IMPORT);
  readonly extraWarning = inject(EXTRA_WARNING, { optional: true });
  readonly successMessage = inject(SUCCESS_MESSAGES, { optional: true });
  readonly extraDetails = inject(EXTRA_DETAILS, { optional: true });
  private readonly requestTaskId = this.store.select(requestTaskQuery.selectRequestTaskId);
  private readonly requestTaskType = this.store.select(requestTaskQuery.selectRequestTaskType);
  private readonly sectionsCompleted = this.store.select(this.sectionsCompletedSelector);
  readonly dataInfo = this.thirdPartyDataProviderStore.select(
    thirdPartyDataProviderQuery.selectThirdPartyDataProviderInfo,
  );
  readonly showWarning = computed<boolean>(() => {
    const sectionsCompleted = this.sectionsCompleted();

    return this.affectedSubtasks.some(
      (subtask) =>
        sectionsCompleted?.[subtask] != undefined &&
        sectionsCompleted?.[subtask] != null &&
        sectionsCompleted[subtask] !== TaskItemStatus.NOT_STARTED,
    );
  });

  readonly taskType = computed(() => {
    const taskType = this.requestTaskType();

    return isAer(taskType) ? 'report' : 'application';
  });

  constructor() {
    effect(() => {
      if (this.requestTaskId()) {
        this.thirdPartyDataProviderStore.loadProviderInfo(this.requestTaskId()).pipe(take(1)).subscribe();
      }
    });
  }

  onImportData() {
    this.service
      .importThirdPartyData(
        IMPORT_THIRD_PARTY_DATA_PROVIDER_SUB_TASK,
        null,
        this.activatedRoute,
        this.dataInfo().payload,
      )
      .pipe(take(1))
      .subscribe(() => {
        const message = this.successMessage?.();
        this.feedbackBannerStore.setSuccessMessages(
          !isNil(message) ? this.successMessage() : ['The data has been successfully imported from the data supplier.'],
        );
      });
  }
}
