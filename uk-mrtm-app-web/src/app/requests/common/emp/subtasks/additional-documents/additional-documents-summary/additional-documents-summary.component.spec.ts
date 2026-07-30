import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { AdditionalDocumentsSummaryComponent } from '@requests/common/emp/subtasks/additional-documents/additional-documents-summary';
import { mockAdditionalDocuments, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import {
  ADDITIONAL_DOCUMENTS_SUB_TASK,
  AdditionalDocumentsWizardStep,
} from '@requests/common/utils/additional-documents';

describe('AdditionalDocumentsSummaryComponent', () => {
  let component: AdditionalDocumentsSummaryComponent;
  let fixture: ComponentFixture<AdditionalDocumentsSummaryComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<unknown>> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'submitSubtask');

  class Page extends BasePage<AdditionalDocumentsSummaryComponent> {
    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(AdditionalDocumentsSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalDocumentsSummaryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    store.setState(
      mockStateBuild(
        { additionalDocuments: mockAdditionalDocuments },
        { additionalDocuments: TaskItemStatus.IN_PROGRESS },
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
      'Change additional documents or information',
      'Uploaded files',
      '100.png',
      'Change uploaded files',
    ]);
  });

  it('should submit subtask', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      ADDITIONAL_DOCUMENTS_SUB_TASK,
      AdditionalDocumentsWizardStep.SUMMARY,
      route,
    );
  });
});
