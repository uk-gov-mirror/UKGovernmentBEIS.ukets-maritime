import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import {
  AER_AGGREGATED_DATA_SUB_TASK,
  AerAggregatedDataWizardStep,
} from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data.helpers';
import { AerFetchFromVoyagesAndPortsComponent } from '@requests/common/aer/subtasks/aer-aggregated-data/aer-fetch-from-voyages-and-ports/aer-fetch-from-voyages-and-ports.component';
import { mockAerStateBuild } from '@requests/common/aer/testing';
import { mockAerSubmittedPayload } from '@requests/common/aer/testing/aer-submitted.mock';
import { taskProviders } from '@requests/common/task.providers';

describe('AerFetchFromVoyagesAndPortsComponent', () => {
  class Page extends BasePage<AerFetchFromVoyagesAndPortsComponent> {}

  let component: AerFetchFromVoyagesAndPortsComponent;
  let fixture: ComponentFixture<AerFetchFromVoyagesAndPortsComponent>;
  let page: Page;
  let store: RequestTaskStore;
  const taskServiceMock: MockType<TaskService<any>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };
  const activatedRouteMock = new ActivatedRouteStub();
  const taskServiceSpy = vi.spyOn(taskServiceMock, 'saveSubtask');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AerFetchFromVoyagesAndPortsComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        ...taskProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AerFetchFromVoyagesAndPortsComponent);
    store = TestBed.inject(RequestTaskStore);
    store.setState(mockAerStateBuild({ ...mockAerSubmittedPayload?.aer }, { emissions: TaskItemStatus.COMPLETED }));
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.heading1.textContent).toEqual('Import aggregated data from voyages and ports');
    expect(page.submitButton.textContent).toEqual('Yes, import data');
    expect(page.query('strong.govuk-warning-text__text').textContent).toEqual(
      'If you import the aggregated data from voyages and ports, all of the data that has been entered will be replaced.',
    );
    expect(page.query('a').textContent).toEqual('Return to: Aggregated data for ships');
  });

  it('should call taskService when hit button', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledWith(
      AER_AGGREGATED_DATA_SUB_TASK,
      AerAggregatedDataWizardStep.FETCH_FROM_VOYAGES_AND_PORTS,
      activatedRouteMock,
      null,
    );
  });
});
