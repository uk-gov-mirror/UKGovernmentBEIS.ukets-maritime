import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { take, tap } from 'rxjs';

import { AuthStore, selectUserId } from '@netz/common/auth';
import {
  RelatedAsyncDocumentsComponent,
  RelatedDocumentsComponent,
  RelatedPreviewAsyncDocumentsMap,
  RelatedPreviewDocumentsMap,
  TASK_RELATED_PREVIEW_ASYNC_DOCUMENTS_MAP,
  TASK_RELATED_PREVIEW_DOCUMENTS_MAP,
} from '@netz/common/components';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { CheckboxComponent, CheckboxesComponent, GovukSelectOption, SelectComponent } from '@netz/govuk-components';

import { notifyOperatorActionPayloadMap } from '@requests/common/components/notify-operator/notify-operator-action-payload.map';
import { getNotifyOperatorConfigByRequestType } from '@requests/common/components/notify-operator/notify-operator-form/notify-operator-form.helpers';
import { notifyOperatorFormProvider } from '@requests/common/components/notify-operator/notify-operator-form/notify-operator-form.provider';
import { TASK_FORM } from '@requests/common/task-form.token';
import { WizardStepComponent } from '@shared/components';
import { UserInfoResolverPipe } from '@shared/pipes';
import { NotifyUsersService } from '@shared/services/notify-users.service';

@Component({
  selector: 'mrtm-notify-operator',
  imports: [
    KeyValuePipe,
    CheckboxesComponent,
    ReactiveFormsModule,
    CheckboxComponent,
    WizardStepComponent,
    UserInfoResolverPipe,
    SelectComponent,
    RelatedDocumentsComponent,
    RelatedAsyncDocumentsComponent,
  ],
  standalone: true,
  templateUrl: './notify-operator-form.component.html',
  providers: [notifyOperatorFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotifyOperatorFormComponent {
  protected readonly config = computed(() => {
    const taskType = this.store.select(requestTaskQuery.selectRequestTaskType)();
    return getNotifyOperatorConfigByRequestType(taskType);
  });
  protected readonly form: UntypedFormGroup = inject(TASK_FORM);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly notifyUsersService: NotifyUsersService = inject(NotifyUsersService);
  private readonly relatedPreviewDocumentsMap: RelatedPreviewDocumentsMap = inject(TASK_RELATED_PREVIEW_DOCUMENTS_MAP, {
    optional: true,
  });
  private readonly relatedPreviewAsyncDocumentsMap: RelatedPreviewAsyncDocumentsMap = inject(
    TASK_RELATED_PREVIEW_ASYNC_DOCUMENTS_MAP,
    {
      optional: true,
    },
  );

  accountId = this.store.select(requestTaskQuery.selectRequestTaskAccountId)();
  requestTaskId = this.store.select(requestTaskQuery.selectRequestTaskId)();
  requestTaskType = this.store.select(requestTaskQuery.selectRequestTaskType)();
  previewDocuments = this.relatedPreviewDocumentsMap?.()?.[this.requestTaskType]
    ? this.relatedPreviewDocumentsMap()[this.requestTaskType].filter((item) => item.visibleInNotify)
    : [];
  previewAsyncDocuments = this.relatedPreviewAsyncDocumentsMap?.()?.[this.requestTaskType]
    ? this.relatedPreviewAsyncDocumentsMap()[this.requestTaskType].filter((item) => item.visibleInNotify)
    : [];

  readonly allOperatorsInfo = toSignal(this.notifyUsersService.getAllOperatorsInfo(this.accountId));
  readonly externalContacts = toSignal(this.notifyUsersService.getExternalContacts());
  readonly assignees = toSignal(
    this.notifyUsersService.getAssignees(this.requestTaskId).pipe(
      tap((assignees) => {
        this.populateAssigneeDropDown(assignees);
      }),
    ),
  );

  onSubmit() {
    const { requestTaskActionType, payloadType } =
      notifyOperatorActionPayloadMap[this.store.select(requestTaskQuery.selectRequestTaskPayload)().payloadType];
    this.notifyUsersService
      .submitDecisionToOperator(this.requestTaskId, this.form.value, requestTaskActionType, payloadType)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['success'], { relativeTo: this.route, skipLocationChange: true });
      });
  }

  private populateAssigneeDropDown(assignees: GovukSelectOption<string>[]) {
    const userId = this.authStore.select(selectUserId);
    const res = assignees.find((a) => a.value === userId());

    if (this.config()?.hasSignatoryField && res) {
      this.form.get('signatory').setValue(res.value);
    }
  }
}
