import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { EMISSION_SOURCES_SUB_TASK, EmissionSourcesWizardStep } from '@requests/common/emp/subtasks/emission-sources';
import { EmissionSourcesCompletionComponent } from '@requests/common/emp/subtasks/emission-sources/emission-sources-completion';
import { EmissionSourcesFactorsComponent } from '@requests/common/emp/subtasks/emission-sources/emission-sources-factors/emission-sources-factors.component';
import {
  mockEmpEmissionSources,
  mockEmpIssuanceSubmitRequestTask,
  mockStateBuild,
} from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('EmissionSourceFactorsComponent', () => {
  let fixture: ComponentFixture<EmissionSourcesFactorsComponent>;
  let component: EmissionSourcesFactorsComponent;
  let page: Page;
  let store: RequestTaskStore;

  class Page extends BasePage<EmissionSourcesFactorsComponent> {
    get radios() {
      return this.queryAll<HTMLInputElement>('input[type="radio"]');
    }

    get errorSummaryLinks() {
      return Array.from(this.errorSummary.querySelectorAll('a'));
    }
  }

  const activatedRouteStub = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<EmpTaskPayload>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };

  const taskServiceSpy = vi.spyOn(taskServiceMock, 'saveSubtask');

  const createComponent = () => {
    fixture = TestBed.createComponent(EmissionSourcesFactorsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmissionSourcesCompletionComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        ...taskProviders,
      ],
    });
  });

  describe('for new emission source', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(mockEmpIssuanceSubmitRequestTask);
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.heading1.textContent).toEqual('Determination of emission factors');
      expect(page.submitButton).toBeTruthy();
      expect(page.errorSummary).toBeFalsy();
      expect(page.radios).toHaveLength(2);
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryLinks).toHaveLength(1);
      expect(page.errorSummaryLinks.map((anchor) => anchor.textContent.trim())).toEqual([
        'Select yes if you are using default values for all emissions factors',
      ]);
    });
  });

  describe('for existing emission source', () => {
    beforeEach(() => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(
        mockStateBuild(
          {
            sources: mockEmpEmissionSources,
          },
          { sources: TaskItemStatus.IN_PROGRESS },
        ),
      );
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.heading1.textContent).toEqual('Determination of emission factors');
      expect(page.submitButton).toBeTruthy();
      expect(page.errorSummary).toBeFalsy();
      expect(page.radios).toHaveLength(2);
    });

    it('should edit and submit a valid form without `factors` section', async () => {
      page.radios[0].click();
      fixture.detectChanges();

      page.submitButton.click();
      fixture.detectChanges();

      expect(taskServiceSpy).toHaveBeenCalledWith(
        EMISSION_SOURCES_SUB_TASK,
        EmissionSourcesWizardStep.EMISSION_FACTORS,
        activatedRouteStub,
        {
          exist: true,
        },
      );
    });

    it('should submit a valid form', async () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        EMISSION_SOURCES_SUB_TASK,
        EmissionSourcesWizardStep.EMISSION_FACTORS,
        activatedRouteStub,
        mockEmpEmissionSources.emissionFactors,
      );
    });
  });
});
