import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { RequestTaskItemDTO } from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';

import { ActivatedRouteStub, BasePage } from '../../testing';
import { RelatedDocumentsComponent } from './related-documents.component';
import { PreviewDocument } from './related-documents.providers';

describe('RelatedDocumentsComponent', () => {
  let component: RelatedDocumentsComponent;
  let fixture: ComponentFixture<RelatedDocumentsComponent>;
  let store: AuthStore;
  let page: Page;

  const mockRequestTaskItem: RequestTaskItemDTO = {
    requestTask: { id: 1337, assigneeUserId: '7b91199c-4770-4d4b-a0ed-d6d9667de157' },
  };
  const mockPreviewDocuments: PreviewDocument[] = [
    {
      filename: 'letter.txt',
      documentType: 'EMP',
      visibleInRelatedActions: true,
      visibleInNotify: true,
    },
  ];

  class Page extends BasePage<RelatedDocumentsComponent> {
    get links() {
      return this.queryAll<HTMLLinkElement>('li > a');
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub(),
        },
      ],
    }).overrideComponent(RelatedDocumentsComponent, {
      set: { host: { 'test-id': 'component-spec' } },
    });

    store = TestBed.inject(AuthStore);
    store.setUserState({ userId: 'test-user-id' });
    fixture = TestBed.createComponent(RelatedDocumentsComponent);
    fixture.componentRef.setInput('previewDocuments', mockPreviewDocuments);
    fixture.componentRef.setInput('taskId', mockRequestTaskItem.requestTask.id);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTML elements', () => {
    expect(page.links.map((el) => [el.href, el.textContent?.trim()])).toEqual([
      ['http://localhost:3000/?filename=letter.txt&signatory=test-user-id', 'letter.txt'],
    ]);
  });
});
