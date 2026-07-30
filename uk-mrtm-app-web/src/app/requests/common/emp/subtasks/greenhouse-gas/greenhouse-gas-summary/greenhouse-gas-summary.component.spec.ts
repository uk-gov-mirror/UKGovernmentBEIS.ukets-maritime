import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import {
  GREENHOUSE_GAS_SUB_TASK,
  GreenhouseGasSummaryComponent,
  GreenhouseGasWizardStep,
} from '@requests/common/emp/subtasks/greenhouse-gas';
import { greenhouseGasMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { mockGreenhouseGas, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('GreenhouseGasSummaryComponent', () => {
  let fixture: ComponentFixture<GreenhouseGasSummaryComponent>;
  let component: GreenhouseGasSummaryComponent;
  let store: RequestTaskStore;
  let page: Page;

  const activatedRouteStub = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<unknown>> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };

  const taskServiceSpy = vi.spyOn(taskServiceMock, 'submitSubtask');

  class Page extends BasePage<GreenhouseGasSummaryComponent> {
    get summaryListTerms(): string[] {
      return this.queryAll('dt').map((dt) => dt.textContent.trim());
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GreenhouseGasSummaryComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        ...taskProviders,
      ],
    });

    store = TestBed.inject(RequestTaskStore);
    store.setState(
      mockStateBuild(
        {
          greenhouseGas: mockGreenhouseGas,
        },
        {
          greenhouseGas: TaskItemStatus.IN_PROGRESS,
        },
      ),
    );

    fixture = TestBed.createComponent(GreenhouseGasSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.heading1.textContent).toEqual('Check your answers');

    expect(page.queryAll('h2').map((item) => item.textContent.trim())).toEqual([
      greenhouseGasMap.fuel.title,
      greenhouseGasMap.crossChecks.title,
      greenhouseGasMap.information.title,
      greenhouseGasMap.qaEquipment.title,
      greenhouseGasMap.voyages.title,
    ]);

    expect([...new Set(page.summaryListTerms)]).toEqual([
      'Procedure reference',
      'Procedure version',
      'Description of procedure',
      'Name of person or position responsible for this procedure',
      'Location where records are kept',
      'Name of IT system used',
    ]);
  });

  it('should submit subtask', () => {
    page.standardButton.click();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      GREENHOUSE_GAS_SUB_TASK,
      GreenhouseGasWizardStep.SUMMARY,
      activatedRouteStub,
    );
  });
});
