import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import { taskProviders } from '@requests/common/task.providers';
import {
  MARITIME_EMISSIONS_SUB_TASK,
  MaritimeEmissionsWizardStep,
} from '@requests/tasks/doe-submit/subtasks/maritime-emissions';
import { DeterminationReasonComponent } from '@requests/tasks/doe-submit/subtasks/maritime-emissions/determination-reason';
import {
  mockDoeMaritimeEmissions,
  mockDoeSubmitSubmitRequestTask,
  mockStateBuild,
} from '@requests/tasks/doe-submit/testing/doe-submit-data.mock';

describe('DeterminationReasonComponent', () => {
  let component: DeterminationReasonComponent;
  let fixture: ComponentFixture<DeterminationReasonComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();
  const taskService: MockType<TaskService<any>> = { saveSubtask: vi.fn().mockReturnValue(of({})) };
  const taskServiceSpy = vi.spyOn(taskService, 'saveSubtask');

  class Page extends BasePage<DeterminationReasonComponent> {
    get typeRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="details.type"]');
    }

    get furtherDetails() {
      return this.query<HTMLInputElement>('#furtherDetails').value;
    }

    set furtherDetails(value: string) {
      this.setInputValue(`#furtherDetails`, value);
    }

    get noticeText() {
      return this.getInputValue('#details.noticeText');
    }

    set noticeText(value: string) {
      this.setInputValue(`#details.noticeText`, value);
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(DeterminationReasonComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeterminationReasonComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        ...taskProviders,
      ],
    }).compileComponents();
  });

  describe('for new determination reason', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockDoeSubmitSubmitRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.errorSummary).toBeFalsy();
      expect(page.heading1).toBeTruthy();
      expect(page.heading1.textContent).toEqual(
        'Reason for determining maritime emissions or emissions figure for surrender',
      );
      expect(page.submitButton).toBeTruthy();
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();
      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(1);
      expect(page.errorSummaryListContents).toEqual([
        'Select why are you determining the maritime emissions or emissions figure for surrender',
      ]);

      page.typeRadios[1].click();
      page.submitButton.click();
      fixture.detectChanges();
      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryListContents.length).toEqual(1);
      expect(page.errorSummaryListContents).toEqual(['Enter a notice text']);
    });
  });

  describe('for existing determination reason', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(
        mockStateBuild(
          { maritimeEmissions: mockDoeMaritimeEmissions },
          { maritimeEmissions: TaskItemStatus.IN_PROGRESS },
        ),
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
        'Reason for determining maritime emissions or emissions figure for surrender',
      );
      expect(page.typeRadios[1].checked).toBeTruthy();
      expect(page.noticeText).toEqual('test notice text');
      expect(page.furtherDetails).toEqual('test further details');
      expect(page.submitButton).toBeTruthy();
    });

    it(`should edit and submit a valid form`, async () => {
      page.furtherDetails = 'further details edited';
      page.typeRadios[0].click();
      page.noticeText = 'test';
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        MARITIME_EMISSIONS_SUB_TASK,
        MaritimeEmissionsWizardStep.DETERMINATION_REASON,
        route,
        {
          details: { type: 'VERIFIED_REPORT_NOT_SUBMITTED_IN_ACCORDANCE_WITH_ORDER', noticeText: 'test' },
          furtherDetails: 'further details edited',
        },
      );
    });
  });
});
