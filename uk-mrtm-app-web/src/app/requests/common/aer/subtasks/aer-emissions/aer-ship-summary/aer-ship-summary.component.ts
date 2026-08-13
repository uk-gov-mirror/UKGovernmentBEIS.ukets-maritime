import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { AerShipEmissions, EmissionsSources } from '@mrtm/api';

import { PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AerEmissionsWizardStep,
  isShipWizardCompleted,
} from '@requests/common/aer/subtasks/aer-emissions/aer-emissions.helpers';
import { SUMMARY_CHANGE_LINKS_MAP } from '@requests/common/aer/subtasks/aer-emissions/aer-ship-summary/aer-ship-summary.consts';
import { aerEmissionsMap } from '@requests/common/aer/subtasks/aer-subtasks-list.map';
import { EMISSIONS_SUB_TASK } from '@requests/common/components/emissions/emissions.helpers';
import { AerShipSummaryTemplateComponent } from '@shared/components/summaries/list-of-ships/aer-ship-summary-template/aer-ship-summary-template.component';
import { FuelsAndEmissionsFactors } from '@shared/types';

@Component({
  selector: 'mrtm-aer-ship-summary',
  imports: [
    PageHeadingComponent,
    AerShipSummaryTemplateComponent,
    RouterLink,
    LinkDirective,
    PendingButtonDirective,
    ButtonDirective,
  ],
  standalone: true,
  templateUrl: './aer-ship-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerShipSummaryComponent {
  private readonly taskService: TaskService<AerSubmitTaskPayload> = inject(TaskService<AerSubmitTaskPayload>);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  readonly shipId = input<string>();
  readonly ship = computed(() => this.store.select(aerCommonQuery.selectShip(this.shipId()))());

  public readonly vm = computed(() => {
    return {
      caption: this.store.select(aerCommonQuery.selectShipName(this.shipId()))(),
      ship: this.ship(),
      isEditable: this.store.select(aerCommonQuery.selectIsShipEditable(this.shipId()))(),
      isShipStatusCompleted: this.store.select(aerCommonQuery.selectIsShipStatusCompleted(this.shipId()))(),
      isShipWizardCompleted: isShipWizardCompleted(this.ship()),
      changeLinks: SUMMARY_CHANGE_LINKS_MAP,
      subtasksMap: aerEmissionsMap,
    };
  });

  constructor() {
    if (this.activatedRoute.snapshot.queryParams?.['change'] === 'true') {
      this.router.navigate([], { queryParams: { change: null }, queryParamsHandling: 'merge', replaceUrl: true });
    }
  }

  public onAddItem(subtaskStep: keyof Pick<AerShipEmissions, 'emissionsSources' | 'fuelsAndEmissionsFactors'>): void {
    this.router.navigate(
      [
        subtaskStep === 'emissionsSources'
          ? AerEmissionsWizardStep.EMISSION_SOURCES_FORM
          : AerEmissionsWizardStep.FUELS_AND_EMISSIONS_FORM,
        crypto.randomUUID(),
      ],
      { relativeTo: this.activatedRoute, queryParams: { change: true, create: true }, queryParamsHandling: 'merge' },
    );
  }

  public onRemoveItem({
    type,
    item,
  }: {
    type: keyof Pick<AerShipEmissions, 'fuelsAndEmissionsFactors' | 'emissionsSources'>;
    item: FuelsAndEmissionsFactors | EmissionsSources;
  }): void {
    this.taskService
      .saveSubtask(
        EMISSIONS_SUB_TASK,
        type === 'emissionsSources'
          ? AerEmissionsWizardStep.EMISSION_SOURCES_LIST
          : AerEmissionsWizardStep.FUELS_AND_EMISSIONS_LIST,
        this.activatedRoute,
        item.uniqueIdentifier,
      )
      .pipe(take(1))
      .subscribe();
  }

  public onContinue(): void {
    this.taskService
      .saveSubtask(EMISSIONS_SUB_TASK, AerEmissionsWizardStep.SHIP_SUMMARY, this.activatedRoute, this.shipId())
      .pipe(take(1))
      .subscribe();
  }
}
