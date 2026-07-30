import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { AerShipEmissions } from '@mrtm/api';

import { FeedbackBannerComponent, FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AER_SUBTASK_NEW_ENTRY_FLOW } from '@requests/common/aer/aer.consts';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AER_VOYAGES_SUB_TASK,
  AerVoyagesWizardStep,
} from '@requests/common/aer/subtasks/aer-voyages/aer-voyages.helpers';
import { aerVoyagesMap } from '@requests/common/aer/subtasks/aer-voyages/aer-voyages-subtask-list.map';
import { validateIfUsedFuelsExistInEmissionsValidator } from '@requests/common/aer/subtasks/utils';
import { VoyageSummaryTemplateComponent } from '@shared/components/summaries';
import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-aer-voyage-emission-summary',
  imports: [
    RouterLink,
    ButtonDirective,
    LinkDirective,
    PendingButtonDirective,
    PageHeadingComponent,
    VoyageSummaryTemplateComponent,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './aer-voyage-emission-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerVoyageEmissionSummaryComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly taskService: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly feedbackBannerStore: FeedbackBannerStore = inject(FeedbackBannerStore);

  readonly isAddNewVoyage = inject(AER_SUBTASK_NEW_ENTRY_FLOW, { optional: true });
  readonly form = new UntypedFormGroup({});
  readonly editable: Signal<boolean> = this.store.select(requestTaskQuery.selectIsEditable);
  readonly voyageId: InputSignal<string> = input<string>();
  readonly voyage = computed(() => {
    const voyage = this.store.select(aerCommonQuery.selectVoyage(this.voyageId()))();

    return {
      ...voyage,
      fuelConsumptions: (voyage?.fuelConsumptions ?? []).map((fuelConsumption) => ({
        ...fuelConsumption,
        needsReview: !isNil(validateIfUsedFuelsExistInEmissionsValidator([fuelConsumption], voyage.relatedShip)),
      })),
    };
  });
  readonly ship: Signal<AerShipEmissions> = computed(() =>
    this.store.select(aerCommonQuery.selectRelatedShipForVoyage(this.voyageId()))(),
  );

  readonly isVoyageCompleted = computed(() =>
    this.store.select(aerCommonQuery.selectIsVoyageStatusCompleted(this.voyageId()))(),
  );

  readonly wizardStep = AerVoyagesWizardStep;
  readonly wizardMap = aerVoyagesMap;

  onSubmit(): void {
    const { fuelConsumptions } = this.voyage();
    const relatedShip = this.ship();
    const errors = validateIfUsedFuelsExistInEmissionsValidator(fuelConsumptions, relatedShip);

    if (!isNil(errors)) {
      this.form.setErrors(errors);
      this.feedbackBannerStore.setInvalidForm(this.form);
      return;
    }

    this.taskService
      .saveSubtask(
        AER_VOYAGES_SUB_TASK,
        this.isAddNewVoyage
          ? AerVoyagesWizardStep.NEW_FUEL_EMISSIONS_SUMMARY
          : AerVoyagesWizardStep.FUEL_EMISSIONS_SUMMARY,
        this.activatedRoute,
        this.voyageId(),
      )
      .pipe(take(1))
      .subscribe();
  }
}
