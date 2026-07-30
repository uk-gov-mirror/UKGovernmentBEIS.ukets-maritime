import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { AerSmf } from '@mrtm/api';

import {
  FeedbackBannerComponent,
  FeedbackBannerStore,
  PageHeadingComponent,
  ReturnToTaskOrActionPageComponent,
} from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, WarningTextComponent } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AER_REDUCTION_CLAIM_SUB_TASK,
  ReductionClaimWizardStep,
} from '@requests/common/aer/subtasks/reduction-claim/reduction-claim.helpers';
import { reductionClaimMap } from '@requests/common/aer/subtasks/reduction-claim/reduction-claim.map';
import { ReductionClaimDetailsSummaryTemplateComponent } from '@shared/components';
import { ReductionClaimDetailsListItemDto, SubTaskListMap, WithNeedsReview } from '@shared/types';

@Component({
  selector: 'mrtm-reduction-claim-details',
  imports: [
    ButtonDirective,
    PageHeadingComponent,
    ReductionClaimDetailsSummaryTemplateComponent,
    ReturnToTaskOrActionPageComponent,
    RouterLink,
    WarningTextComponent,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './reduction-claim-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReductionClaimDetailsComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly service: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly formGroup = new UntypedFormGroup({});
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);

  public readonly isEditable: Signal<boolean> = this.store.select(requestTaskQuery.selectIsEditable);
  public readonly wizardMap: SubTaskListMap<AerSmf> = reductionClaimMap;
  public readonly wizardStep: typeof ReductionClaimWizardStep = ReductionClaimWizardStep;
  public readonly data: Signal<Array<WithNeedsReview<ReductionClaimDetailsListItemDto>>> = this.store.select(
    aerCommonQuery.selectReductionClaimDetailsListItems,
  );
  public readonly thirdPartyDataProviderName = this.store.select(aerCommonQuery.selectThirdPartyDataProviderName);

  public readonly warningMessage: Signal<string> = computed(() =>
    this.data().find((fuel) => fuel.needsReview && fuel.dataInputType === 'EXTERNAL_PROVIDER')
      ? 'Data imported from a supplier does not include supporting evidence. Import the supporting evidence manually to continue.'
      : undefined,
  );

  public onChange(item: ReductionClaimDetailsListItemDto): void {
    this.router.navigate([item.uniqueIdentifier], {
      relativeTo: this.activatedRoute,
    });
  }

  public onDelete(item: ReductionClaimDetailsListItemDto): void {
    this.service
      .saveSubtask(AER_REDUCTION_CLAIM_SUB_TASK, this.wizardStep.DELETE_FUEL_PURCHASE, this.activatedRoute, item)
      .pipe(take(1))
      .subscribe();
  }

  public onContinue(): void {
    this.formGroup.setErrors({});

    if (this.data().find((item) => item.dataInputType === 'EXTERNAL_PROVIDER' && item.needsReview)) {
      this.formGroup.setErrors({ needsReview: 'Import the supporting evidence for the highlighted entries. ' });
      this.feedbackBannerStore.setInvalidForm(this.formGroup);
      return;
    }

    this.router.navigate([this.wizardStep.SUMMARY], { relativeTo: this.activatedRoute });
  }
}
