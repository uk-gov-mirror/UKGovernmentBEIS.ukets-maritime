import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { takeUntil } from 'rxjs';

import { PageHeadingComponent } from '@netz/common/components';
import { TaskService } from '@netz/common/forms';
import { DestroySubject } from '@netz/common/services';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import {
  AerEmissionsWizardStep,
  aerFuelsAndEmissionsFactorsValidator,
} from '@requests/common/aer/subtasks/aer-emissions/aer-emissions.helpers';
import { emissionsShipSubtaskMap, emissionsSubtaskMap } from '@requests/common/components/emissions';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { ReturnToShipsListTableComponent } from '@requests/common/components/emissions/return-to-ships-list-table';
import { AerFuelsAndEmissionFactorsSummaryTemplateComponent } from '@shared/components';
import { FuelsAndEmissionsFactors } from '@shared/types';

@Component({
  selector: 'mrtm-aer-fuels-and-emissions-factors-list',
  imports: [
    PageHeadingComponent,
    AerFuelsAndEmissionFactorsSummaryTemplateComponent,
    ButtonDirective,
    ReturnToShipsListTableComponent,
  ],
  standalone: true,
  templateUrl: './aer-fuels-and-emissions-factors-list.component.html',
  providers: [DestroySubject],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerFuelsAndEmissionsFactorsListComponent {
  private readonly taskService = inject(TaskService);
  private readonly store = inject(RequestTaskStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = inject(DestroySubject);

  readonly shipId = input<string>();
  readonly fuelsAndEmissionsFactors = computed(() =>
    this.store.select(aerCommonQuery.selectShipFuelsAndEmissionsFactors(this.shipId()))(),
  );
  readonly canContinue = computed(() => aerFuelsAndEmissionsFactorsValidator(this.fuelsAndEmissionsFactors()));
  readonly hasDeletion = signal(false);

  readonly isEditable = this.store.select(requestTaskQuery.selectIsEditable)();
  readonly taskMap = emissionsShipSubtaskMap;
  readonly shipName = computed(() => this.store.select(aerCommonQuery.selectShipName(this.shipId()))());
  readonly returnToLabel = emissionsSubtaskMap.ships.title;

  handleAddItem(): void {
    this.router.navigate(['../../' + AerEmissionsWizardStep.FUELS_AND_EMISSIONS_FORM, crypto.randomUUID()], {
      relativeTo: this.route,
      queryParams: { change: true, create: true },
      queryParamsHandling: 'merge',
    });
  }

  // TODO align with EMP using isAnyEmissionsNeedsReview
  handleContinue(): void {
    const extraOptions: NavigationExtras = {
      relativeTo: this.route,
    };
    if (this.hasDeletion()) {
      extraOptions.queryParams = { change: true };
      extraOptions.queryParamsHandling = 'merge';
    }
    this.router.navigate([`../../${AerEmissionsWizardStep.EMISSION_SOURCES_LIST}`], extraOptions);
  }

  handleDelete(event: FuelsAndEmissionsFactors) {
    this.taskService
      .saveSubtask(EMISSIONS_SUB_TASK, AerEmissionsWizardStep.FUELS_AND_EMISSIONS_LIST, this.route, {
        shipId: this.shipId(),
        fuelId: event.uniqueIdentifier,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.hasDeletion.update(() => true));
  }
}
