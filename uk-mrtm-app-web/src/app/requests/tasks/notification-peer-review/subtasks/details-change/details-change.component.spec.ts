import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { DetailsChangeComponent } from '@requests/tasks/notification-peer-review/subtasks/details-change';
import {
  mockReviewDecision,
  mockStateBuild,
} from '@requests/tasks/notification-peer-review/testing/notification-peer-review-data.mock';

describe('DetailsChangeComponent', () => {
  let component: DetailsChangeComponent;
  let fixture: ComponentFixture<DetailsChangeComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const route = new ActivatedRouteStub();

  class Page extends BasePage<DetailsChangeComponent> {}

  const createComponent = () => {
    fixture = TestBed.createComponent(DetailsChangeComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsChangeComponent],
      providers: [{ provide: ActivatedRoute, useValue: route }, ...taskProviders],
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(RequestTaskStore);
    store.setState(mockStateBuild(mockReviewDecision, { detailsChange: TaskItemStatus.IN_PROGRESS }));
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.summariesContents).toEqual([
      'Describe the non-significant change',
      'description the non-significant change',
      'Justification for not submitting a variation',
      'some justification',
      'Uploaded files',
      '1.png2.png3.png',
      'Provide the start date of the non-significant change',
      '1 Apr 2020',
      'Provide the end date of the non-significant change',
      '1 Mar 2023',
      'What is your decision for the information submitted?',
      'Accepted',
      'Do you require a response from the operator?',
      'Yes',
      'Explain what the operator should cover in their response',
      'some followup request',
      'Date response is needed',
      '31 Oct 2050',
      'Provide a summary of your decision to be included in the notification letter',
      'some summary',
      'Notes',
      'some notes',
    ]);
  });
});
