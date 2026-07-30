import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { RequestActionStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { emissionSourcesMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { mockSubmittedStateBuild } from '@requests/common/emp/testing/emp-action-data.mock';
import { mockEmpEmissionSources } from '@requests/common/emp/testing/emp-data.mock';
import { taskProviders } from '@requests/common/task.providers';
import { EmissionSourcesSubmittedComponent } from '@requests/timeline/emp-submitted/subtasks/emission-sources';

describe('EmissionSourcesSubmittedComponent', () => {
  let fixture: ComponentFixture<EmissionSourcesSubmittedComponent>;
  let component: EmissionSourcesSubmittedComponent;
  let store: RequestActionStore;
  let page: Page;

  const activatedRouteStub = new ActivatedRouteStub();

  class Page extends BasePage<EmissionSourcesSubmittedComponent> {
    get summaryListTerms(): string[] {
      return this.queryAll('dt').map((dt) => dt.textContent.trim());
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmissionSourcesSubmittedComponent],
      providers: [{ provide: ActivatedRoute, useValue: activatedRouteStub }, ...taskProviders],
    });

    store = TestBed.inject(RequestActionStore);
    store.setState(
      mockSubmittedStateBuild({
        sources: mockEmpEmissionSources,
      }),
    );
    fixture = TestBed.createComponent(EmissionSourcesSubmittedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    page = new Page(fixture);
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.heading1.textContent).toEqual('Procedures related to emissions sources and emissions factors');

    expect(page.queryAll('h2').map((item) => item.textContent.trim())).toEqual([
      emissionSourcesMap.listCompletion.title,
      emissionSourcesMap.emissionFactors.title,
      emissionSourcesMap.emissionCompliance.title,
    ]);

    expect([...new Set(page.summaryListTerms)]).toEqual([
      'Procedure reference',
      'Procedure version',
      'Description of procedure',
      'Name of person or position responsible for this procedure',
      'Location where records are kept',
      'Name of IT system used',
      'Are you using default values for all emissions factors?',
      'Will you be making an emissions reduction claim relating to eligible fuels?',
    ]);
  });
});
