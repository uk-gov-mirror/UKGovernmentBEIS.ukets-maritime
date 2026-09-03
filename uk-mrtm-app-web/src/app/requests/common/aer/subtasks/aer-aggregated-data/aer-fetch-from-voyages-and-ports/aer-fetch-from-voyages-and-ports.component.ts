import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { FeedbackBannerComponent, FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective, WarningTextComponent } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AER_AGGREGATED_DATA_SUB_TASK,
  AerAggregatedDataWizardStep,
} from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data.helpers';
import { aerAggregatedDataSubtasksListMap } from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data-subtasks-list.map';
import { PersistablePaginationService } from '@shared/services';
import { AerJourneyTypeEnum } from '@shared/types';

@Component({
  selector: 'mrtm-aer-fetch-from-voyages-and-ports',
  imports: [
    PageHeadingComponent,
    WarningTextComponent,
    ButtonDirective,
    RouterLink,
    LinkDirective,
    PendingButtonDirective,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './aer-fetch-from-voyages-and-ports.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerFetchFromVoyagesAndPortsComponent {
  private readonly persistablePaginationService = inject(PersistablePaginationService);
  private readonly store = inject(RequestTaskStore);

  private readonly service: TaskService<AerSubmitTaskPayload> = inject(TaskService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  public readonly wizardMap = aerAggregatedDataSubtasksListMap;
  public readonly wizardStep = AerAggregatedDataWizardStep;
  private readonly form: UntypedFormGroup = new UntypedFormGroup({});

  public readonly hasAggregatedData = computed(
    () => this.store.select(aerCommonQuery.selectAggregatedDataList)().length > 0,
  );

  public onSubmit(): void {
    this.feedbackBannerStore.reset();
    this.form.setErrors(this.validateCanExecuteFetchFromVoyagesAndPorts());

    if (!this.form.valid) {
      this.feedbackBannerStore.setInvalidForm(this.form);
      return;
    }

    this.persistablePaginationService.reset();
    this.service
      .saveSubtask(
        AER_AGGREGATED_DATA_SUB_TASK,
        this.wizardStep.FETCH_FROM_VOYAGES_AND_PORTS,
        this.activatedRoute,
        null,
      )
      .pipe(take(1))
      .subscribe();
  }

  private validateCanExecuteFetchFromVoyagesAndPorts(): ValidationErrors | undefined {
    const ports = this.store.select(aerCommonQuery.selectPortsList)();
    const voyages = this.store.select(aerCommonQuery.selectVoyagesList)();

    return !ports?.length &&
      !voyages.find((voyage) => [AerJourneyTypeEnum.Domestic, AerJourneyTypeEnum.NI].includes(voyage.journeyType))
      ? { invalid: 'There are no domestic or in‑port emissions available to import. Check your data and try again.' }
      : undefined;
  }
}
