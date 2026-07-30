import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { RequestActionStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { actionProviders } from '@requests/common/action.providers';
import { mockSubmittedStateBuild } from '@requests/common/emp/testing/emp-action-data.mock';
import { mockEmpDataGaps } from '@requests/common/emp/testing/emp-data.mock';
import { DataGapsSubmittedComponent } from '@requests/timeline/emp-submitted/subtasks/data-gaps';

describe('DataGapsSubmittedComponent', () => {
  let component: DataGapsSubmittedComponent;
  let fixture: ComponentFixture<DataGapsSubmittedComponent>;
  let page: Page;
  let store: RequestActionStore;

  const route = new ActivatedRouteStub();

  class Page extends BasePage<DataGapsSubmittedComponent> {}

  const createComponent = () => {
    fixture = TestBed.createComponent(DataGapsSubmittedComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGapsSubmittedComponent],
      providers: [{ provide: ActivatedRoute, useValue: route }, ...actionProviders],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestActionStore);
    store.setState(mockSubmittedStateBuild({ dataGaps: mockEmpDataGaps }));
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Description of method to estimate fuel consumption',
      'test fuelConsumptionEstimationMethod',
      'Name of person or position responsible for this procedure',
      'test responsiblePersonOrPosition',
      'Formulae used',
      'test formulaeUsed',
      'Data sources',
      'test dataSources',
      'Location where records are kept',
      'test recordsLocation',
      'Name of IT system used',
      'test itSystemUsed',
    ]);
  });
});
