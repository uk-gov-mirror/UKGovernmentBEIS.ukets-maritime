import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { RequestActionStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { actionProviders } from '@requests/common/action.providers';
import { greenhouseGasMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { mockSubmittedStateBuild } from '@requests/common/emp/testing/emp-action-data.mock';
import { mockGreenhouseGas } from '@requests/common/emp/testing/emp-data.mock';
import { GreenhouseGasSubmittedComponent } from '@requests/timeline/emp-submitted/subtasks/greenhouse-gas';

describe('GreenhouseGasSubmittedComponent', () => {
  let fixture: ComponentFixture<GreenhouseGasSubmittedComponent>;
  let component: GreenhouseGasSubmittedComponent;
  let store: RequestActionStore;
  let page: Page;

  const activatedRouteStub = new ActivatedRouteStub();

  class Page extends BasePage<GreenhouseGasSubmittedComponent> {
    get summaryListTerms(): string[] {
      return this.queryAll('dt').map((dt) => dt.textContent.trim());
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GreenhouseGasSubmittedComponent],
      providers: [{ provide: ActivatedRoute, useValue: activatedRouteStub }, ...actionProviders],
    });

    store = TestBed.inject(RequestActionStore);
    store.setState(
      mockSubmittedStateBuild({
        greenhouseGas: mockGreenhouseGas,
      }),
    );
    fixture = TestBed.createComponent(GreenhouseGasSubmittedComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.heading1.textContent).toEqual(
      'Procedures related to the monitoring of greenhouse gas emissions and fuel consumption',
    );

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
});
