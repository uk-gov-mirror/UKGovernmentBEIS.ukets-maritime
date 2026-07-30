import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Route } from '@angular/router';

import { BasePage } from '../../testing';
import { PreviewDocument } from '../related-documents/related-documents.providers';
import { RelatedActionsComponent } from './related-actions.component';
import { RelatedActionsMap, TASK_RELATED_ACTIONS_MAP } from './related-actions.providers';

describe('RelatedActionsComponent', () => {
  let component: RelatedActionsComponent;
  let fixture: ComponentFixture<RelatedActionsComponent>;
  let page: Page;
  const actionsMap: RelatedActionsMap = {
    RFI_SUBMIT: { text: 'Request for information', path: ['rfi'] },
    RDE_SUBMIT: { text: 'Request deadline extension', path: ['rde'] },
  };
  const previewDocuments: PreviewDocument[] = [
    {
      filename: 'letter.txt',
      documentType: 'EMP',
      visibleInRelatedActions: true,
      visibleInNotify: true,
    },
  ];

  class Page extends BasePage<RelatedActionsComponent> {
    get links() {
      return this.queryAll<HTMLLinkElement>('li > a');
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TASK_RELATED_ACTIONS_MAP, useValue: actionsMap },
        { provide: ActivatedRoute, useValue: constructRoute(false) },
      ],
    }).overrideComponent(RelatedActionsComponent, {
      set: { host: { 'test-id': 'component-spec' } },
    });

    fixture = TestBed.createComponent(RelatedActionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('showReassignAction', true);
    fixture.componentRef.setInput('taskId', 1);
    fixture.componentRef.setInput('allowedRequestTaskActions', []);
    fixture.componentRef.setInput('previewDocuments', previewDocuments);
    fixture.componentRef.setInput('previewAsyncDocuments', []);
    fixture.componentRef.setInput('requestTaskType', 'TEST_REQUEST');
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should display the links', async () => {
    expect(page.links.map((el) => [el.href.trim(), el.textContent.trim()])).toEqual([
      ['http://localhost:3000/', 'Reassign task'],
      ['http://localhost:3000/?filename=letter.txt', 'letter.txt'],
    ]);
  });
});

function constructRoute(withChangeAssignee = false): Partial<ActivatedRoute> {
  return {
    snapshot: {
      get routeConfig() {
        return { path: '' };
      },
      get parent(): any {
        return {
          get routeConfig(): Route | null {
            return {
              path: 'parent',
              children: [{ path: withChangeAssignee ? 'change-assignee' : '' }],
            };
          },
        };
      },
    } as any,
  };
}
