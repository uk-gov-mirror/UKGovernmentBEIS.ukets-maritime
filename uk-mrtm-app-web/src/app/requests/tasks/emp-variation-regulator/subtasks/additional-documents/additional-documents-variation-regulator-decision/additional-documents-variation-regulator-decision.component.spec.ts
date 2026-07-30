import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import { mockAdditionalDocuments } from '@requests/common/emp/testing/emp-data.mock';
import { subtaskReviewGroupMap } from '@requests/common/emp/utils';
import { taskProviders } from '@requests/common/task.providers';
import {
  ADDITIONAL_DOCUMENTS_SUB_TASK,
  AdditionalDocumentsWizardStep,
} from '@requests/common/utils/additional-documents';
import { EmpVariationRegulatorService } from '@requests/tasks/emp-variation-regulator/services';
import { AdditionalDocumentsVariationRegulatorDecisionComponent } from '@requests/tasks/emp-variation-regulator/subtasks/additional-documents';
import { mockEmpVariationRegulatorStateBuild } from '@requests/tasks/emp-variation-regulator/testing/emp-variation-regulator-data.mock';
import { HTML_DIFF } from '@shared/directives';

describe('AdditionalDocumentsVariationRegulatorDecisionComponent', () => {
  let component: AdditionalDocumentsVariationRegulatorDecisionComponent;
  let fixture: ComponentFixture<AdditionalDocumentsVariationRegulatorDecisionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<EmpVariationRegulatorService> = {
    saveVariationRegulatorDecision: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveVariationRegulatorDecision');

  class Page extends BasePage<AdditionalDocumentsVariationRegulatorDecisionComponent> {
    get additionalDocumentsSummaryTemplate() {
      return this.query<HTMLElement>('mrtm-additional-documents-summary-template');
    }

    setVariationScheduleItem(value: string, index: number) {
      this.setInputValue(`#variationScheduleItems.${index}.item`, value);
    }

    set notes(value: string) {
      this.setInputValue(`#notes`, value);
    }

    get addItemButton() {
      return this.queryAll<HTMLButtonElement>('button[govukSecondaryButton]').find(
        (el) => el.textContent.trim() === 'Add item',
      );
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(AdditionalDocumentsVariationRegulatorDecisionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalDocumentsVariationRegulatorDecisionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
        { provide: HTML_DIFF, useValue: true },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    store.setState(
      mockEmpVariationRegulatorStateBuild(
        { additionalDocuments: mockAdditionalDocuments },
        { additionalDocuments: TaskItemStatus.IN_PROGRESS },
      ),
    );
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.additionalDocumentsSummaryTemplate).toBeTruthy();
  });

  it('should submit subtask', () => {
    page.addItemButton.click();
    fixture.detectChanges();
    page.submitButton.click();

    fixture.detectChanges();
    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents).toEqual([
      'You must add an item to the list of changes required.',
      'Enter the change required by the operator',
    ]);

    page.setVariationScheduleItem('test change1', 0);
    page.notes = 'test notes';
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      ADDITIONAL_DOCUMENTS_SUB_TASK,
      AdditionalDocumentsWizardStep.VARIATION_REGULATOR_DECISION,
      route,
      {
        notes: 'test notes',
        variationScheduleItems: [
          {
            item: 'test change1',
          },
        ],
      },
      subtaskReviewGroupMap[ADDITIONAL_DOCUMENTS_SUB_TASK],
    );
  });
});
