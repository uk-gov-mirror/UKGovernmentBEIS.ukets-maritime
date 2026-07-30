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
import { AerPortsWizardStep } from '@requests/common/aer/subtasks/aer-ports';
import { AER_PORTS_SUB_TASK } from '@requests/common/aer/subtasks/aer-ports/aer-ports.helpers';
import { aerPortsMap } from '@requests/common/aer/subtasks/aer-ports/aer-ports-subtask-list.map';
import { validateIfUsedFuelsExistInEmissionsValidator } from '@requests/common/aer/subtasks/utils';
import { PortCallSummaryTemplateComponent } from '@shared/components/summaries';
import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-aer-port-call-summary',
  imports: [
    ButtonDirective,
    PageHeadingComponent,
    PortCallSummaryTemplateComponent,
    LinkDirective,
    RouterLink,
    PendingButtonDirective,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './aer-port-call-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerPortCallSummaryComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly feedbackBannerStore: FeedbackBannerStore = inject(FeedbackBannerStore);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly taskService: TaskService<AerSubmitTaskPayload> = inject(TaskService);

  public readonly isAddNewPortCall = inject(AER_SUBTASK_NEW_ENTRY_FLOW, { optional: true });
  public readonly portId: InputSignal<string> = input<string>();
  public readonly wizardMap = aerPortsMap;
  public readonly form = new UntypedFormGroup({});
  public readonly editable: Signal<boolean> = this.store.select(requestTaskQuery.selectIsEditable);
  public readonly port = computed(() => {
    const port = this.store.select(aerCommonQuery.selectPort(this.portId()))();

    return {
      ...port,
      fuelConsumptions: (port?.fuelConsumptions ?? []).map((fuelConsumption) => ({
        ...fuelConsumption,
        needsReview: !isNil(validateIfUsedFuelsExistInEmissionsValidator([fuelConsumption], port.relatedShip)),
      })),
    };
  });
  public readonly ship: Signal<AerShipEmissions> = computed(() =>
    this.store.select(aerCommonQuery.selectShipByImoNumber(this.port()?.imoNumber))(),
  );
  public readonly isPortCompleted = computed(() =>
    this.store.select(aerCommonQuery.selectIsPortStatusCompleted(this.portId()))(),
  );

  public onSubmit(): void {
    const { fuelConsumptions } = this.port();
    const relatedShip = this.ship();
    const errors = validateIfUsedFuelsExistInEmissionsValidator(fuelConsumptions, relatedShip);

    if (!isNil(errors)) {
      this.form.setErrors(errors);
      this.feedbackBannerStore.setInvalidForm(this.form);
      return;
    }

    this.taskService
      .saveSubtask(
        AER_PORTS_SUB_TASK,
        this.isAddNewPortCall ? AerPortsWizardStep.NEW_PORT_CALL_SUMMARY : AerPortsWizardStep.PORT_CALL_SUMMARY,
        this.activatedRoute,
        this.portId(),
      )
      .pipe(take(1))
      .subscribe();
  }
}
