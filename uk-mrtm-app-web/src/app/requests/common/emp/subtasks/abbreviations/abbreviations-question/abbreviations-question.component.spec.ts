import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import {
  ABBREVIATIONS_SUB_TASK,
  AbbreviationsQuestionComponent,
  AbbreviationsWizardStep,
} from '@requests/common/emp/subtasks/abbreviations';
import {
  mockEmpAbbreviations,
  mockEmpIssuanceSubmitRequestTask,
  mockStateBuild,
} from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('AbbreviationsAbbreviationsQuestionComponent', () => {
  let component: AbbreviationsQuestionComponent;
  let fixture: ComponentFixture<AbbreviationsQuestionComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');

  class Page extends BasePage<AbbreviationsQuestionComponent> {
    get existRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="exist"]');
    }

    setAbbreviation(value: string, index: number) {
      this.setInputValue(`#abbreviationDefinitions.${index}.abbreviation`, value);
    }

    setDefinition(value: string, index: number) {
      this.setInputValue(`#abbreviationDefinitions.${index}.definition`, value);
    }

    get addAnotherButton() {
      return this.queryAll<HTMLButtonElement>('button[govukSecondaryButton]').find(
        (el) => el.textContent.trim() === 'Add another',
      );
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(AbbreviationsQuestionComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbbreviationsQuestionComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new abbreviations question', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockEmpIssuanceSubmitRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual(
        'Are you using any abbreviations or terminology in your application which need explanation?',
      );
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(1);
      expect(page.errorSummaryListContents).toEqual([
        'Select ‘Yes’, if you are using any abbreviations or terminology in your application which need explanation',
      ]);
    });
  });

  describe('for existing abbreviations question', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(
        mockStateBuild({ abbreviations: mockEmpAbbreviations }, { abbreviations: TaskItemStatus.IN_PROGRESS }),
      );
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual(
        'Are you using any abbreviations or terminology in your application which need explanation?',
      );
      expect(page.existRadios[0].checked).toBeTruthy();
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      page.addAnotherButton.click();
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummaryListContents).toEqual(['Enter an abbreviation or term used', 'Enter a definition']);

      page.setAbbreviation('abbr3', 2);
      page.setDefinition('def3', 2);
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        ABBREVIATIONS_SUB_TASK,
        AbbreviationsWizardStep.ABBREVIATIONS_QUESTION,
        route,
        {
          exist: true,
          abbreviationDefinitions: [
            ...mockEmpAbbreviations.abbreviationDefinitions,
            {
              abbreviation: 'abbr3',
              definition: 'def3',
            },
          ],
        },
      );
    });

    it(`should submit a valid form`, async () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        ABBREVIATIONS_SUB_TASK,
        AbbreviationsWizardStep.ABBREVIATIONS_QUESTION,
        route,
        mockEmpAbbreviations,
      );
    });
  });
});
