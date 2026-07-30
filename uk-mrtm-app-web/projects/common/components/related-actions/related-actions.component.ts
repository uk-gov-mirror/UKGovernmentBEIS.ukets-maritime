import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { RequestDetailsDTO, RequestTaskDTO, RequestTaskItemDTO } from '@mrtm/api';

import { LinkDirective } from '@netz/govuk-components';

import { RelatedAsyncDocumentsComponent } from '../related-async-documents/related-async-documents.component';
import { PreviewAsyncDocument } from '../related-async-documents/related-async-documents.providers';
import { RelatedDocumentsComponent } from '../related-documents/related-documents.component';
import { PreviewDocument } from '../related-documents/related-documents.providers';
import { RelatedActionsMap, TASK_RELATED_ACTIONS_MAP } from './related-actions.providers';

interface RelatedAction {
  text: string;
  link: string[];
}

@Component({
  selector: 'netz-related-actions',
  imports: [RouterLink, LinkDirective, RelatedDocumentsComponent, RelatedAsyncDocumentsComponent],
  standalone: true,
  template: `
    <aside class="app-related-items" role="complementary">
      <h2 class="govuk-heading-m" id="subsection-title">Related actions</h2>
      <nav role="navigation" aria-labelledby="subsection-title">
        <ul class="govuk-list govuk-!-font-size-16">
          @for (action of relatedActions(); track action) {
            @if (action.link) {
              <li>
                <a [routerLink]="action.link" govukLink [relativeTo]="route">{{ action.text }}</a>
              </li>
            }
          }
        </ul>
      </nav>
      <netz-related-documents [previewDocuments]="previewDocuments()" [taskId]="taskId()" />
      <netz-related-async-documents [previewDocuments]="previewAsyncDocuments()" [taskId]="taskId()" />
    </aside>
  `,
  styleUrl: './related-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedActionsComponent {
  protected readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly actionsMap: RelatedActionsMap = inject(TASK_RELATED_ACTIONS_MAP);

  readonly allowedRequestTaskActions = input.required<RequestTaskItemDTO['allowedRequestTaskActions']>();
  readonly taskId = input.required<RequestTaskDTO['id'] | RequestDetailsDTO['id']>();
  readonly requestTaskType = input<RequestTaskDTO['type'] | RequestDetailsDTO['requestType']>();
  readonly previewDocuments = input.required<PreviewDocument[]>();
  readonly previewAsyncDocuments = input.required<PreviewAsyncDocument[]>();
  readonly showReassignAction = input<boolean>(false);
  readonly reassignAction = input<RelatedAction>({ text: 'Reassign task', link: ['change-assignee'] });
  readonly relatedActions: Signal<RelatedAction[]> = computed(() => this.filterRelatedActions());

  private filterRelatedActions() {
    let result: { text: string; link: string[] }[];
    const actions = this.allowedRequestTaskActions();
    const order = Object.values(this.actionsMap).map((action) => action.text);

    result = actions
      .filter((action) => action in this.actionsMap)
      .map((action) => {
        const path = this.actionsMap[action].path;
        return {
          text: this.actionsMap[action].text,
          link:
            typeof path === 'function'
              ? path({
                  taskId: this.taskId(),
                  requestTaskType: this.requestTaskType?.(),
                })
              : path,
        };
      })
      .sort((a, b) => order.indexOf(a.text) - order.indexOf(b.text));

    if (this.showReassignAction()) {
      const { text, link } = this.reassignAction();
      result = [{ text, link }, ...result];
    }

    return result;
  }
}
