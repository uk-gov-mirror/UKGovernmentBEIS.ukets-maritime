import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { RdePayload } from '@mrtm/api';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { rdeQuery } from '@requests/common/emp/request-deadline-extension/+state';
import { RdeWizardSteps } from '@requests/common/emp/request-deadline-extension/request-deadline-extension.consts';
import {
  RequestDeadlineExtensionApiService,
  RequestDeadlineExtensionStore,
} from '@requests/common/emp/request-deadline-extension/services';
import { RequestDeadlineExtensionSummaryTemplateComponent } from '@shared/components';
import { UserInfoResolverPipe } from '@shared/pipes';
import { NotifyUsersService } from '@shared/services';

interface ViewModel {
  data: RdePayload;
  wizardSteps: Record<string, string>;
  queryParams?: Params;
  isEditable?: boolean;
}

@Component({
  selector: 'mrtm-request-deadline-extension-summary',
  imports: [
    PageHeadingComponent,
    ReturnToTaskOrActionPageComponent,
    PendingButtonDirective,
    ButtonDirective,
    RequestDeadlineExtensionSummaryTemplateComponent,
  ],
  standalone: true,
  templateUrl: './request-deadline-extension-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestDeadlineExtensionSummaryComponent {
  private readonly taskStore = inject(RequestTaskStore);
  private readonly rdeStore = inject(RequestDeadlineExtensionStore);
  private readonly rdeService = inject(RequestDeadlineExtensionApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifyUsersService: NotifyUsersService = inject(NotifyUsersService);
  private readonly userInfoPipe: UserInfoResolverPipe = new UserInfoResolverPipe();
  private readonly accountId = this.taskStore.select(requestTaskQuery.selectRequestTaskAccountId)();
  private readonly requestTaskId = this.taskStore.select(requestTaskQuery.selectRequestTaskId)();
  private readonly allOperatorsInfo = toSignal(this.notifyUsersService.getAllOperatorsInfo(this.accountId));
  private readonly assignees = toSignal(this.notifyUsersService.getAssignees(this.requestTaskId));

  public readonly vm: Signal<ViewModel> = computed(() => {
    const { signatory, operators, ...rest } = this.rdeStore.select(rdeQuery.selectRde)();

    return this.allOperatorsInfo()
      ? {
          data: {
            ...rest,
            operators: [
              Object.keys(this.allOperatorsInfo()?.autoNotifiedOperators ?? {}).map((operator) =>
                this.userInfoPipe.transform(operator, this.allOperatorsInfo()?.autoNotifiedOperators),
              ),
              (operators ?? []).map((operator) =>
                this.userInfoPipe.transform(operator, this.allOperatorsInfo()?.otherOperators),
              ),
            ].flat(),
            signatory: this.assignees()?.find((x) => x.value === signatory)?.text,
          },
          queryParams: { change: true },
          isEditable: true,
          wizardSteps: RdeWizardSteps,
        }
      : null;
  });

  public onSubmit(): void {
    this.rdeService.submit(this.rdeStore.select(rdeQuery.selectPayload)()).subscribe(() => {
      this.router.navigate([RdeWizardSteps.SUCCESS], { relativeTo: this.route });
    });
  }
}
