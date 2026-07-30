import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { RequestActionStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { actionProviders } from '@requests/common/action.providers';
import { mockSubmittedStateBuild } from '@requests/common/emp/testing/emp-action-data.mock';
import { mockEmpAbbreviations } from '@requests/common/emp/testing/emp-data.mock';
import { AbbreviationsSubmittedComponent } from '@requests/timeline/emp-submitted/subtasks/abbreviations';

describe('AbbreviationsSubmittedComponent', () => {
  let component: AbbreviationsSubmittedComponent;
  let fixture: ComponentFixture<AbbreviationsSubmittedComponent>;
  let page: Page;
  let store: RequestActionStore;

  const route = new ActivatedRouteStub();

  class Page extends BasePage<AbbreviationsSubmittedComponent> {}

  const createComponent = () => {
    fixture = TestBed.createComponent(AbbreviationsSubmittedComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbbreviationsSubmittedComponent],
      providers: [{ provide: ActivatedRoute, useValue: route }, ...actionProviders],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestActionStore);
    store.setState(mockSubmittedStateBuild({ abbreviations: mockEmpAbbreviations }));
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Are you using any abbreviations or terminology in your application which need explanation?',
      'Yes',
      'Abbreviation, acronym or terminology',
      'Abbreviation1',
      'Definition',
      'Definition1',
      'Abbreviation, acronym or terminology',
      'Abbreviation2',
      'Definition',
      'Definition2',
    ]);
  });
});
