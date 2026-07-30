import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { GREENHOUSE_GAS_SUB_TASK, GreenhouseGasWizardStep } from '@requests/common/emp/subtasks/greenhouse-gas';
import { GreenhouseGasFuelComponent } from '@requests/common/emp/subtasks/greenhouse-gas/greenhouse-gas-fuel/greenhouse-gas-fuel.component';
import {
  mockEmpIssuanceSubmitRequestTask,
  mockEmpProcedureForm,
  mockGreenhouseGas,
  mockStateBuild,
} from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('GreenhouseGasFuelComponent', () => {
  let fixture: ComponentFixture<GreenhouseGasFuelComponent>;
  let component: GreenhouseGasFuelComponent;
  let page: Page;
  let store: RequestTaskStore;

  class Page extends BasePage<GreenhouseGasFuelComponent> {
    get textboxes() {
      return this.queryAll<HTMLInputElement>('input[type="text"], textarea');
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
    fixture = TestBed.createComponent(GreenhouseGasFuelComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GreenhouseGasFuelComponent],
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
      expect(page.heading1.textContent).toEqual('Determining fuel bunkered and fuel in tanks');
      expect(page.submitButton).toBeTruthy();
      expect(page.errorSummary).toBeFalsy();
      expect(page.textboxes).toHaveLength(6);
    });

    it('should display error on empty form submit', () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeTruthy();
      expect(page.errorSummaryLinks).toHaveLength(4);
      expect(page.errorSummaryLinks.map((anchor) => anchor.textContent.trim())).toEqual([
        'Enter a procedure reference',
        'Enter a description for the procedure',
        'Enter the name of the person or position responsible for this procedure',
        'Enter the location where records are kept',
      ]);
    });
  });

  describe('for existing emission source', () => {
    beforeEach(async () => {
      store = TestBed.inject(RequestTaskStore);
      store.setState(
        mockStateBuild(
          {
            greenhouseGas: mockGreenhouseGas,
          },
          { greenhouseGas: TaskItemStatus.IN_PROGRESS },
        ),
      );
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display all HTMLElements and form with 0 errors', () => {
      expect(page.heading1.textContent).toEqual('Determining fuel bunkered and fuel in tanks');
      expect(page.submitButton).toBeTruthy();
      expect(page.errorSummary).toBeFalsy();
      expect(page.textboxes).toHaveLength(6);
    });

    it('should edit and submit a valid form', async () => {
      page.setInputValue('input[name="version"]', 'test new value');

      page.submitButton.click();
      fixture.detectChanges();

      expect(taskServiceSpy).toHaveBeenCalledWith(
        GREENHOUSE_GAS_SUB_TASK,
        GreenhouseGasWizardStep.FUEL,
        activatedRouteStub,
        {
          ...mockEmpProcedureForm,
          version: 'test new value',
        },
      );
    });

    it('should submit a valid form', async () => {
      page.submitButton.click();
      fixture.detectChanges();

      expect(page.errorSummary).toBeFalsy();
      expect(taskServiceSpy).toHaveBeenCalledWith(
        GREENHOUSE_GAS_SUB_TASK,
        GreenhouseGasWizardStep.FUEL,
        activatedRouteStub,
        mockEmpProcedureForm,
      );
    });
  });
});
