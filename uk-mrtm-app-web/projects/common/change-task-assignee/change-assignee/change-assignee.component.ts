import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject, combineLatest, iif, map, mergeMap, Observable } from 'rxjs';

import { RequestTaskDTO, TasksAssignmentService, TasksReleaseService, UserStateDTO } from '@mrtm/api';

import { AuthStore, selectUserState } from '@netz/common/auth';
import { PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { UserFullNamePipe } from '@netz/common/pipes';
import { PendingRequestService } from '@netz/common/services';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import {
  ButtonDirective,
  ErrorSummaryComponent,
  GovukSelectOption,
  GovukValidators,
  SelectComponent,
} from '@netz/govuk-components';

interface ViewModel {
  requestTask: RequestTaskDTO;
  showErrorSummary: boolean;
  form: UntypedFormGroup;
  options: GovukSelectOption<string>[];
}

@Component({
  selector: 'netz-change-assignee',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    PageHeadingComponent,
    PendingButtonDirective,
    ErrorSummaryComponent,
    SelectComponent,
    ButtonDirective,
  ],
  standalone: true,
  templateUrl: './change-assignee.component.html',
  providers: [UserFullNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeAssigneeComponent {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly store = inject(RequestTaskStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userFullNamePipe = inject(UserFullNamePipe);
  private readonly tasksAssignmentService = inject(TasksAssignmentService);
  private readonly tasksReleaseService = inject(TasksReleaseService);
  private readonly pendingRequestService = inject(PendingRequestService);

  private readonly UNASSIGNED_VALUE = 'unassigned_dummy_value'; // shouldn't be a uuid (uuid represent user ids)
  private readonly showErrorSummary$ = new BehaviorSubject(false);
  private form = this.fb.group({
    assignee: [null, { validators: [GovukValidators.required('Select a person')] }],
  });
  private options: GovukSelectOption[];

  protected vm$: Observable<ViewModel> = combineLatest([
    this.authStore.rxSelect(selectUserState),
    this.store.rxSelect(requestTaskQuery.selectRequestTaskItem),
    this.showErrorSummary$.asObservable(),
  ]).pipe(
    mergeMap(([userState, { requestTask }, showErrorSummary]) =>
      this.tasksAssignmentService
        .getCandidateAssigneesByTaskId(requestTask.id)
        .pipe(map((candidates) => ({ userState, candidates, requestTask, showErrorSummary }))),
    ),
    map(({ userState, candidates, requestTask, showErrorSummary }) => {
      const options = [
        ...(!!requestTask.assigneeUserId && this.allowReleaseTask(userState.roleType)
          ? [{ text: 'Unassigned', value: this.UNASSIGNED_VALUE }]
          : []),
        ...candidates
          .filter((candidates) => candidates.id !== requestTask?.assigneeUserId)
          .map((candidate) => ({
            text: this.userFullNamePipe.transform(candidate),
            value: candidate.id,
          })),
      ];
      this.options = options;

      return {
        requestTask,
        options,
        form: this.form,
        showErrorSummary,
      };
    }),
  );

  submit(taskId: number, userId: string): void {
    if (!this.form.valid) {
      this.showErrorSummary$.next(true);
    } else {
      this.showErrorSummary$.next(false);
      iif(
        () => userId !== this.UNASSIGNED_VALUE,
        this.tasksAssignmentService.assignTask({ taskId, userId }),
        this.tasksReleaseService.releaseTask(taskId),
      )
        .pipe(this.pendingRequestService.trackRequest())
        .subscribe(() => {
          this.store.setTaskReassignedTo(
            userId === this.UNASSIGNED_VALUE ? null : (this.options.find((o) => o.value === userId)?.text ?? null),
          );
          this.router.navigate(['success'], { relativeTo: this.route });
        });
    }
  }

  private allowReleaseTask(role: UserStateDTO['roleType']) {
    return role !== 'OPERATOR';
  }
}
