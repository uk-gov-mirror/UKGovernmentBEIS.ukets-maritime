import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { RfiSubmitPayload } from '@mrtm/api';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective } from '@netz/govuk-components';

import { empCommonQuery, empReviewQuery } from '@requests/common/emp/+state';
import { rfiQuery } from '@requests/common/emp/request-for-information/+state';
import { RfiWizardSteps } from '@requests/common/emp/request-for-information/request-for-information.consts';
import {
  RequestForInformationApiService,
  RequestForInformationStore,
} from '@requests/common/emp/request-for-information/services';
import { RequestForInformationSummaryTemplateComponent } from '@shared/components';
import { UserInfoResolverPipe } from '@shared/pipes';
import { NotifyUsersService } from '@shared/services';
import { RfiSubmitDto, UploadedFile } from '@shared/types';

interface ViewModel {
  data: RfiSubmitDto;
  wizardSteps: Record<string, string>;
  queryParams?: Params;
  isEditable?: boolean;
}

@Component({
  selector: 'mrtm-request-for-information-summary',
  imports: [
    RequestForInformationSummaryTemplateComponent,
    PageHeadingComponent,
    PendingButtonDirective,
    ReturnToTaskOrActionPageComponent,
    ButtonDirective,
  ],
  standalone: true,
  templateUrl: './request-for-information-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestForInformationSummaryComponent {
  private readonly taskStore = inject(RequestTaskStore);
  private readonly rfiStore = inject(RequestForInformationStore);
  private readonly rfiService = inject(RequestForInformationApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifyUsersService: NotifyUsersService = inject(NotifyUsersService);
  private readonly userInfoPipe: UserInfoResolverPipe = new UserInfoResolverPipe();
  private readonly accountId = this.taskStore.select(requestTaskQuery.selectRequestTaskAccountId)();
  private readonly requestTaskId = this.taskStore.select(requestTaskQuery.selectRequestTaskId)();
  private readonly allOperatorsInfo = toSignal(this.notifyUsersService.getAllOperatorsInfo(this.accountId));
  private readonly assignees = toSignal(this.notifyUsersService.getAssignees(this.requestTaskId));

  public readonly wizardSteps = RfiWizardSteps;

  public readonly vm: Signal<ViewModel> = computed(() => {
    const { files, operators, signatory, ...rest } =
      this.rfiStore.select(rfiQuery.selectRfi)() ?? ({} as RfiSubmitPayload);
    const downloadUrl = this.taskStore.select(empCommonQuery.selectTasksDownloadUrl)();
    const attachments = this.taskStore.select(empReviewQuery.selectReviewAttachments)();

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
            files: (files ?? []).map((file: string | UploadedFile) => ({
              downloadUrl: `${downloadUrl}${typeof file === 'string' ? file : file?.uuid}`,
              fileName: typeof file === 'string' ? attachments?.[file] : file?.file?.name,
            })),
          },
          wizardSteps: RfiWizardSteps,
          isEditable: true,
          queryParams: { change: true },
        }
      : null;
  });

  public onSubmit(): void {
    const rfiPayload = this.rfiStore.select(rfiQuery.selectPayload)();

    this.rfiService
      .submit({
        ...rfiPayload,
        rfiSubmitPayload: {
          ...rfiPayload.rfiSubmitPayload,
          files: (rfiPayload?.rfiSubmitPayload?.files ?? []).map((file: string | UploadedFile) =>
            typeof file === 'string' ? file : file?.uuid,
          ),
        },
      })
      .subscribe(() => {
        this.router.navigate([this.wizardSteps.SUCCESS], { relativeTo: this.route });
      });
  }
}
