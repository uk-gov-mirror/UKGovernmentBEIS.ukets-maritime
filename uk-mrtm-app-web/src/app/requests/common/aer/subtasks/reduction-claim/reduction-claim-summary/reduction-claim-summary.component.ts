import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { AerFuelOriginFossilTypeName, AerSmf } from '@mrtm/api';

import {
  FeedbackBannerComponent,
  FeedbackBannerStore,
  PageHeadingComponent,
  ReturnToTaskOrActionPageComponent,
} from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, WarningTextComponent } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AER_REDUCTION_CLAIM_SUB_TASK,
  isWizardCompleted,
  ReductionClaimWizardStep,
} from '@requests/common/aer/subtasks/reduction-claim/reduction-claim.helpers';
import { reductionClaimMap } from '@requests/common/aer/subtasks/reduction-claim/reduction-claim.map';
import { TaskItemStatus } from '@requests/common/task-item-status';
import {
  ReductionClaimDetailsSummaryTemplateComponent,
  ReductionClaimSummaryTemplateComponent,
} from '@shared/components';
import { ReductionClaimDetailsListItemDto, SubTaskListMap, WithNeedsReview } from '@shared/types';

@Component({
  selector: 'mrtm-reduction-claim-summary',
  imports: [
    PageHeadingComponent,
    ButtonDirective,
    ReturnToTaskOrActionPageComponent,
    ReductionClaimSummaryTemplateComponent,
    PendingButtonDirective,
    ReductionClaimDetailsSummaryTemplateComponent,
    RouterLink,
    WarningTextComponent,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './reduction-claim-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReductionClaimSummaryComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly service: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly feedbackBannerStore: FeedbackBannerStore = inject(FeedbackBannerStore);
  private readonly status: Signal<TaskItemStatus> = this.store.select(aerCommonQuery.selectStatusForReductionClaim);
  private readonly form = new UntypedFormGroup({});

  public readonly wizardMap: SubTaskListMap<AerSmf> = reductionClaimMap;
  public readonly wizardStep: typeof ReductionClaimWizardStep = ReductionClaimWizardStep;
  public readonly data: Signal<AerSmf> = this.store.select(aerCommonQuery.selectReductionClaim);
  public readonly thirdPartyDataProviderName = this.store.select(aerCommonQuery.selectThirdPartyDataProviderName);
  public readonly fuelPurchases: Signal<Array<WithNeedsReview<ReductionClaimDetailsListItemDto>>> = this.store.select(
    aerCommonQuery.selectReductionClaimDetailsListItems,
  );
  public readonly editable: Signal<boolean> = this.store.select(requestTaskQuery.selectIsEditable);
  public readonly canSubmit: Signal<boolean> = computed(() => {
    const status = this.status();
    const reductionClaim = this.data();

    return this.editable() && status !== TaskItemStatus.COMPLETED && isWizardCompleted(reductionClaim);
  });

  public readonly warningMessage: Signal<string> = computed(() =>
    this.status() === TaskItemStatus.NEEDS_REVIEW
      ? 'You must review the emissions reduction claim'
      : this.fuelPurchases().find((fuel) => fuel.needsReview && fuel.dataInputType === 'EXTERNAL_PROVIDER')
        ? 'Data imported from a supplier does not include supporting evidence. Import the supporting evidence manually to continue.'
        : undefined,
  );

  public onChange(item: ReductionClaimDetailsListItemDto): void {
    this.router.navigate([this.wizardStep.DETAILS, item?.uniqueIdentifier], {
      relativeTo: this.activatedRoute,
      queryParams: { change: true },
    });
  }

  public onDelete(item: ReductionClaimDetailsListItemDto): void {
    this.service
      .saveSubtask(AER_REDUCTION_CLAIM_SUB_TASK, this.wizardStep.DELETE_FUEL_PURCHASE, this.activatedRoute, item)
      .pipe(take(1))
      .subscribe();
  }

  public onSubmit(): void {
    const errors: ValidationErrors = {};
    let isValid = true;
    const allFuels = this.store.select(aerCommonQuery.selectSupersetOfFuelTypes)();
    const fuelPurchases = this.fuelPurchases();

    for (const fuelOriginTypeName of fuelPurchases
      ?.map((item) => item.fuelOriginTypeName)
      .filter(Boolean) as Array<AerFuelOriginFossilTypeName>) {
      if (
        !allFuels.find(
          (shipFuel: AerFuelOriginFossilTypeName) =>
            shipFuel?.origin === fuelOriginTypeName.origin &&
            shipFuel?.type === fuelOriginTypeName.type &&
            shipFuel?.name === fuelOriginTypeName.name,
        )
      ) {
        errors['fuelConsumptions'] = 'The field “Fuel name” has an invalid value';
        isValid = false;
        break;
      }
    }

    if (fuelPurchases.find((fuelPurchase) => fuelPurchase.needsReview)) {
      errors['needsReview'] =
        'Data imported from a supplier does not include supporting evidence. Import the supporting evidence manually to continue.';
      isValid = false;
    }

    if (!isValid) {
      this.form.setErrors(errors);
      this.feedbackBannerStore.setInvalidForm(this.form);
      return;
    }

    this.service
      .submitSubtask(AER_REDUCTION_CLAIM_SUB_TASK, ReductionClaimWizardStep.SUMMARY, this.activatedRoute)
      .pipe(take(1))
      .subscribe();
  }
}
