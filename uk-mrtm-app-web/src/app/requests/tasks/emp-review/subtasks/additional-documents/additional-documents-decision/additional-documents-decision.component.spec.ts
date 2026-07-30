import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import { mockAdditionalDocuments, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { taskProviders } from '@requests/common/task.providers';
import {
  ADDITIONAL_DOCUMENTS_SUB_TASK,
  AdditionalDocumentsWizardStep,
} from '@requests/common/utils/additional-documents';
import { EmpReviewService } from '@requests/tasks/emp-review/services';
import { AdditionalDocumentsDecisionComponent } from '@requests/tasks/emp-review/subtasks/additional-documents';

describe('AdditionalDocumentsDecisionComponent', () => {
  let component: AdditionalDocumentsDecisionComponent;
  let fixture: ComponentFixture<AdditionalDocumentsDecisionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpReviewService> = {
    saveReviewDecision: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveReviewDecision');

  class Page extends BasePage<AdditionalDocumentsDecisionComponent> {
    get typeRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="type"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(AdditionalDocumentsDecisionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalDocumentsDecisionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
        { [mockAdditionalDocuments.documents[0]]: '100.png' },
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
    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents).toEqual(['Select a decision for this review group']);

    page.typeRadios[0].click();
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      ADDITIONAL_DOCUMENTS_SUB_TASK,
      AdditionalDocumentsWizardStep.DECISION,
      route,
      { notes: null, type: 'ACCEPTED' },
      subtaskReviewGroupMap[ADDITIONAL_DOCUMENTS_SUB_TASK],
    );
  });
});
