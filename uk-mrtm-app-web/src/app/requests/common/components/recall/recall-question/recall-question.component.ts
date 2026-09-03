import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TasksService } from '@mrtm/api';

import { PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import {
  BusinessErrorService,
  catchNotFoundRequest,
  catchTaskReassignedBadRequest,
  ErrorCodes,
  requestTaskReassignedError,
  taskNotFoundError,
} from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective } from '@netz/govuk-components';

import { recallActionsMap } from '@requests/common/recall-actions.map';

@Component({
  selector: 'mrtm-recall-question',
  imports: [
    PageHeadingComponent,
    ButtonDirective,
    PendingButtonDirective,
    LinkDirective,
    RouterLink,
    ReturnToTaskOrActionPageComponent,
  ],
  standalone: true,
  templateUrl: './recall-question.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecallQuestionComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly tasksService: TasksService = inject(TasksService);
  private readonly pendingRequest: PendingRequestService = inject(PendingRequestService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly businessErrorService: BusinessErrorService = inject(BusinessErrorService);
  private readonly requestTask = this.store.select(requestTaskQuery.selectRequestTaskType)();

  public readonly actionMap = recallActionsMap?.[this.requestTask];

  public recallTask(): void {
    this.tasksService
      .processRequestTaskAction({
        requestTaskId: this.store.select(requestTaskQuery.selectRequestTaskId)(),
        requestTaskActionType: this.actionMap?.actionType,
        requestTaskActionPayload: {
          payloadType: 'EMPTY_PAYLOAD',
        },
      })
      .pipe(
        this.pendingRequest.trackRequest(),
        catchNotFoundRequest(ErrorCodes.NOTFOUND1001, () =>
          this.businessErrorService.showErrorForceNavigation(taskNotFoundError),
        ),
        catchTaskReassignedBadRequest(() =>
          this.businessErrorService.showErrorForceNavigation(requestTaskReassignedError()),
        ),
      )
      .subscribe(() => {
        this.router.navigate(['success'], { relativeTo: this.route });
      });
  }
}
