import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { TaskItemStatus } from '@requests/common/task-item-status';
import { ReturnForAmendsConfirmComponent } from '@requests/tasks/notification-follow-up-review/return-for-amends/return-for-amends-confirm/index';
import { FollowUpReviewService } from '@requests/tasks/notification-follow-up-review/services';
import {
  mockFollowUpReviewDecision,
  mockStateBuild,
} from '@requests/tasks/notification-follow-up-review/testing/notification-follow-up-review-data.mock';

describe('ReturnForAmendsConfirmComponent', () => {
  let component: ReturnForAmendsConfirmComponent;
  let fixture: ComponentFixture<ReturnForAmendsConfirmComponent>;
  let page: Page;
  let store: RequestTaskStore;
  let router: Router;

  const route = new ActivatedRouteStub();
  const taskService: MockType<FollowUpReviewService> = {
    submit: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'submit');

  class Page extends BasePage<ReturnForAmendsConfirmComponent> {
    get confirmButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(ReturnForAmendsConfirmComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnForAmendsConfirmComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: TaskService, useValue: taskService },
        provideHttpClient(),
        provideHttpClientTesting(),
        ...taskProviders,
      ],
    }).compileComponents();
    store = TestBed.inject(RequestTaskStore);
    store.setState(mockStateBuild(mockFollowUpReviewDecision, { reviewDecision: TaskItemStatus.AMENDS_NEEDED }));
    router = TestBed.inject(Router);
    route.setUrl([new UrlSegment('/', {})]);
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should edit and submit a valid form`, async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    page.confirmButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['success'], { skipLocationChange: true, relativeTo: route });
  });
});
