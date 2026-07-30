import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { RequestActionStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { actionProviders } from '@requests/common/action.providers';
import { controlActivitiesMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { mockSubmittedStateBuild } from '@requests/common/emp/testing/emp-action-data.mock';
import { mockEmpControlActivities } from '@requests/common/emp/testing/emp-data.mock';
import { ControlActivitiesSubmittedComponent } from '@requests/timeline/emp-submitted/subtasks/control-activities';

describe('ControlActivitiesSubmittedComponent', () => {
  let fixture: ComponentFixture<ControlActivitiesSubmittedComponent>;
  let component: ControlActivitiesSubmittedComponent;
  let store: RequestActionStore;
  let page: Page;

  const activatedRouteStub = new ActivatedRouteStub();

  class Page extends BasePage<ControlActivitiesSubmittedComponent> {
    get summaryListTerms(): string[] {
      return this.queryAll('dt').map((dt) => dt.textContent.trim());
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ControlActivitiesSubmittedComponent],
      providers: [{ provide: ActivatedRoute, useValue: activatedRouteStub }, ...actionProviders],
    });

    store = TestBed.inject(RequestActionStore);
    store.setState(
      mockSubmittedStateBuild({
        controlActivities: mockEmpControlActivities,
      }),
    );
    fixture = TestBed.createComponent(ControlActivitiesSubmittedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    page = new Page(fixture);
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.heading1.textContent).toEqual('Control activities');

    expect(page.queryAll('h2').map((item) => item.textContent.trim())).toEqual([
      controlActivitiesMap.qualityAssurance.title,
      controlActivitiesMap.internalReviews.title,
      controlActivitiesMap.corrections.title,
      controlActivitiesMap.outsourcedActivities.title,
      controlActivitiesMap.documentation.title,
    ]);

    expect([...new Set(page.summaryListTerms)]).toEqual([
      'Procedure reference',
      'Procedure version',
      'Description of procedure',
      'Name of person or position responsible for this procedure',
      'Location where records are kept',
      'Name of IT system used',
      'Are any of your activities outsourced?',
    ]);
  });
});
