import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { AerAdditionalDocumentsSummaryComponent } from '@requests/common/aer/subtasks/aer-additional-documents';
import { mockAerAdditionalDocuments, mockAerStateBuild } from '@requests/common/aer/testing';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import {
  ADDITIONAL_DOCUMENTS_SUB_TASK,
  AdditionalDocumentsWizardStep,
} from '@requests/common/utils/additional-documents';

describe('AerAerAdditionalDocumentsSummaryComponent', () => {
  let component: AerAdditionalDocumentsSummaryComponent;
  let fixture: ComponentFixture<AerAdditionalDocumentsSummaryComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<unknown>> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'submitSubtask');

  class Page extends BasePage<AerAdditionalDocumentsSummaryComponent> {
    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(AerAdditionalDocumentsSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AerAdditionalDocumentsSummaryComponent],
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
      mockAerStateBuild(
        { additionalDocuments: mockAerAdditionalDocuments },
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
      'Do you want to upload any additional documents or information?',
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
