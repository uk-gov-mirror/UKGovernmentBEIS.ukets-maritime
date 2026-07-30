import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AerShipAggregatedData } from '@mrtm/api';

import { FeedbackBannerComponent, FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AER_SUBTASK_NEW_ENTRY_FLOW } from '@requests/common/aer/aer.consts';
import { mapAggregatedDataToTotalShipEmissionsItems } from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data.helpers';
import { aerAggregatedDataSubtasksListMap } from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data-subtasks-list.map';
import { AerAggregatedDataEmissionsCalculationsSummaryTemplateComponent } from '@shared/components';
import { AerAggregatedDataEmissionDto } from '@shared/types';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'mrtm-aer-aggregated-data-ship-emissions-calculated',
  imports: [
    PageHeadingComponent,
    AerAggregatedDataEmissionsCalculationsSummaryTemplateComponent,
    RouterLink,
    ButtonDirective,
    LinkDirective,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './aer-aggregated-data-ship-emissions-calculated.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerAggregatedDataShipEmissionsCalculatedComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly feedbackBannerStore: FeedbackBannerStore = inject(FeedbackBannerStore);
  private readonly form: UntypedFormGroup = new UntypedFormGroup({});

  public readonly isAddNewAggregatedData = inject(AER_SUBTASK_NEW_ENTRY_FLOW, { optional: true });
  public readonly wizardMap = aerAggregatedDataSubtasksListMap;
  public readonly dataId: InputSignal<string> = input<string>();
  public readonly data: Signal<AerShipAggregatedData> = computed(() =>
    this.store.select(aerCommonQuery.selectAggregatedDataItem(this.dataId()))(),
  );
  public readonly ship = computed(() =>
    this.store.select(aerCommonQuery.selectRelatedShipForAggregatedData(this.dataId()))(),
  );

  public readonly totalShipEmissionsData = computed<Array<AerAggregatedDataEmissionDto>>(() =>
    mapAggregatedDataToTotalShipEmissionsItems(this.data()),
  );

  public onSubmit(): void {
    const currentAggregatedData = this.data();
    let isValid = true;
    const errors: ValidationErrors = {};

    if (new BigNumber(currentAggregatedData.totalShipEmissions).lt(0)) {
      errors['totalShipEmissions'] = 'The total ship emissions should be greater than or equal to 0';
      isValid = false;
    }

    if (new BigNumber(currentAggregatedData.surrenderEmissions).lt(0)) {
      errors['surrenderEmissions'] = 'The emissions figure for surrender should be greater than or equal to 0';
      isValid = false;
    }

    if (!isValid) {
      this.form.setErrors(errors);
      this.feedbackBannerStore.setInvalidForm(this.form);
      return;
    }

    this.form.reset();
    this.feedbackBannerStore.reset();
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }
}
