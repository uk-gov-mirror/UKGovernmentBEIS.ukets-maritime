import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  runInInjectionContext,
  Type,
  ViewEncapsulation,
} from '@angular/core';

import { ItemDTO, RequestActionInfoDTO, RequestTaskDTO, RequestTaskItemDTO } from '@mrtm/api';

import {
  PageHeadingComponent,
  PreviewAsyncDocument,
  PreviewDocument,
  RelatedActionsComponent,
  RelatedPreviewAsyncDocumentsMap,
  RelatedPreviewDocumentsMap,
  RelatedTasksComponent,
  TASK_RELATED_PREVIEW_ASYNC_DOCUMENTS_MAP,
  TASK_RELATED_PREVIEW_DOCUMENTS_MAP,
  TaskHeaderInfoComponent,
  TaskListComponent,
  TimelineComponent,
  TimelineItemComponent,
} from '@netz/common/components';
import { TaskSection } from '@netz/common/model';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';

import { REQUEST_TASK_PAGE_CONTENT } from '../../request-task.providers';
import { RequestTaskPageContentFactoryMap } from '../../request-task.types';

type ViewModel = {
  requestId: string;
  requestTask: RequestTaskDTO;
  header: string;
  headerSize: 'l' | 'xl';
  sections: TaskSection[] | null;
  pageTopComponent: Type<unknown> | null;
  contentComponent: Type<unknown> | null;
  postHeaderComponent: Type<unknown> | null;
  preContentComponents: Array<Type<unknown>> | null;
  postContentComponent: Type<unknown> | null;
  relatedTasks: ItemDTO[];
  hasRelatedTasks: boolean;
  timeline: RequestActionInfoDTO[];
  hasTimeline: boolean;
  showAssignAction: boolean;
  relatedActions: RequestTaskItemDTO['allowedRequestTaskActions'];
  hasSidebar: boolean;
  previewDocuments: PreviewDocument[];
  previewAsyncDocuments: PreviewAsyncDocument[];
};

/* eslint-disable @angular-eslint/use-component-view-encapsulation */
@Component({
  selector: 'netz-request-task-page',
  imports: [
    PageHeadingComponent,
    TaskHeaderInfoComponent,
    NgComponentOutlet,
    RelatedTasksComponent,
    TimelineComponent,
    TimelineItemComponent,
    RelatedActionsComponent,
    TaskListComponent,
  ],
  standalone: true,
  templateUrl: './request-task-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class RequestTaskPageComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  private readonly contentFactoryMap: RequestTaskPageContentFactoryMap = inject(REQUEST_TASK_PAGE_CONTENT);
  private readonly relatedPreviewDocumentsMap: RelatedPreviewDocumentsMap = inject(TASK_RELATED_PREVIEW_DOCUMENTS_MAP, {
    optional: true,
  });
  private readonly relatedPreviewAsyncDocumentsMap: RelatedPreviewAsyncDocumentsMap = inject(
    TASK_RELATED_PREVIEW_ASYNC_DOCUMENTS_MAP,
    {
      optional: true,
    },
  );
  private readonly injector: Injector = inject(Injector);
  private readonly relatedActionsHiddenFromSidebar = ['SYSTEM_MESSAGE_DISMISS'];

  readonly vm = computed<ViewModel>(() => {
    const requestTask = this.store.select(requestTaskQuery.selectRequestTask)();
    if (!requestTask) {
      return null;
    }

    const requestId = this.store.select(requestTaskQuery.selectRequestId)();
    const relatedTasks = this.store.select(requestTaskQuery.selectRelatedTasks)();
    const timeline = this.store.select(requestTaskQuery.selectTimeline)();
    const showAssignAction = this.store.select(requestTaskQuery.selectIsAssignActionVisible)();
    const relatedActions = this.store.select(requestTaskQuery.selectRelatedActions)();
    const {
      header,
      headerSize,
      sections,
      pageTopComponent,
      contentComponent,
      postHeaderComponent,
      preContentComponent,
      postContentComponent,
    } = runInInjectionContext(this.injector, () => this.contentFactoryMap[requestTask.type]());
    const previewDocuments = this.relatedPreviewDocumentsMap?.()?.[requestTask.type]
      ? this.relatedPreviewDocumentsMap()[requestTask.type].filter((item) => item.visibleInRelatedActions)
      : [];
    const previewAsyncDocuments = this.relatedPreviewAsyncDocumentsMap?.()?.[requestTask.type]
      ? this.relatedPreviewAsyncDocumentsMap()[requestTask.type].filter((item) => item.visibleInRelatedActions)
      : [];
    const hasSidebar =
      relatedActions?.filter((action) => !this.relatedActionsHiddenFromSidebar.includes(action)).length > 0 ||
      previewDocuments?.length > 0 ||
      previewAsyncDocuments?.length > 0 ||
      showAssignAction;

    return {
      requestId,
      requestTask,
      header,
      headerSize,
      sections,
      pageTopComponent,
      contentComponent,
      postHeaderComponent,
      preContentComponents: preContentComponent ? [preContentComponent].flat() : null,
      postContentComponent,
      relatedTasks,
      timeline,
      relatedActions,
      showAssignAction,
      hasRelatedTasks: relatedTasks?.length > 0,
      hasTimeline: timeline?.length > 0,
      hasSidebar,
      previewDocuments,
      previewAsyncDocuments,
    };
  });

  constructor() {
    effect(() => {
      if (!!this.vm() && !this.vm().contentComponent && !this.vm().sections) {
        throw new Error(
          'You need to provide either a content component or the sections for the request task page to work',
        );
      }
    });
  }
}
