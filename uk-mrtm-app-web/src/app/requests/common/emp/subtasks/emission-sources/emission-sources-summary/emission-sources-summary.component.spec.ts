import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { EMISSION_SOURCES_SUB_TASK, EmissionSourcesWizardStep } from '@requests/common/emp/subtasks/emission-sources';
import { EmissionSourcesSummaryComponent } from '@requests/common/emp/subtasks/emission-sources/emission-sources-summary/emission-sources-summary.component';
import { emissionSourcesMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { mockEmpEmissionSources, mockStateBuild } from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';

describe('EmissionSourcesSummaryComponent', () => {
  let fixture: ComponentFixture<EmissionSourcesSummaryComponent>;
  let component: EmissionSourcesSummaryComponent;
  let store: RequestTaskStore;
  let page: Page;

  const activatedRouteStub = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<unknown>> = {
    submitSubtask: vi.fn().mockReturnValue(of({})),
  };

  const taskServiceSpy = vi.spyOn(taskServiceMock, 'submitSubtask');

  class Page extends BasePage<EmissionSourcesSummaryComponent> {
    get summaryListTerms(): string[] {
      return this.queryAll('dt').map((dt) => dt.textContent.trim());
    }

    get heading2s(): string[] {
      return this.queryAll('h2').map((h2) => h2.textContent.trim());
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmissionSourcesSummaryComponent],
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
          sources: mockEmpEmissionSources,
        },
        {
          sources: TaskItemStatus.IN_PROGRESS,
        },
      ),
    );
    fixture = TestBed.createComponent(EmissionSourcesSummaryComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.heading1.textContent).toEqual('Check your answers');

    expect(page.heading2s).toEqual([
      emissionSourcesMap.listCompletion.title,
      emissionSourcesMap.emissionFactors.title,
      emissionSourcesMap.emissionCompliance.title,
    ]);

    expect(page.summaryListTerms).toEqual([
      'Procedure reference',
      'Procedure version',
      'Description of procedure',
      'Name of person or position responsible for this procedure',
      'Location where records are kept',
      'Name of IT system used',
      'Are you using default values for all emissions factors?',
      'Procedure reference',
      'Procedure version',
      'Description of procedure',
      'Name of person or position responsible for this procedure',
      'Location where records are kept',
      'Name of IT system used',
      'Will you be making an emissions reduction claim relating to eligible fuels?',
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
      EMISSION_SOURCES_SUB_TASK,
      EmissionSourcesWizardStep.SUMMARY,
      activatedRouteStub,
    );
  });
});
