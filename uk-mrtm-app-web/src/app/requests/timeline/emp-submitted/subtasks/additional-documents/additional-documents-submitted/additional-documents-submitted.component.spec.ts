import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { RequestActionStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { actionProviders } from '@requests/common/action.providers';
import { mockSubmittedStateBuild } from '@requests/common/emp/testing/emp-action-data.mock';
import { mockAdditionalDocuments } from '@requests/common/emp/testing/emp-data.mock';
import { AdditionalDocumentsSubmittedComponent } from '@requests/timeline/emp-submitted/subtasks/additional-documents';

describe('AdditionalDocumentsSubmittedComponent', () => {
  let component: AdditionalDocumentsSubmittedComponent;
  let fixture: ComponentFixture<AdditionalDocumentsSubmittedComponent>;
  let page: Page;
  let store: RequestActionStore;

  const route = new ActivatedRouteStub();

  class Page extends BasePage<AdditionalDocumentsSubmittedComponent> {}

  const createComponent = () => {
    fixture = TestBed.createComponent(AdditionalDocumentsSubmittedComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalDocumentsSubmittedComponent],
      providers: [{ provide: ActivatedRoute, useValue: route }, ...actionProviders],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestActionStore);
    store.setState(
      mockSubmittedStateBuild(
        { additionalDocuments: mockAdditionalDocuments },
        { '11111111-1111-4111-a111-111111111111': '100.png' },
      ),
    );
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Do you want to upload any additional documents or information to support your application?',
      'Yes',
      'Uploaded files',
      '100.png',
    ]);
  });
});
