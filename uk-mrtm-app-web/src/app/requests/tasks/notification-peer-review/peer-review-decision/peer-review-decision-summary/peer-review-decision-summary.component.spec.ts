import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';

import { of } from 'rxjs';

import { TasksService } from '@mrtm/api';

import { ActivatedRouteStub, mockClass } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { selectIsDecisionSubmitted } from '@requests/tasks/notification-peer-review/+state';
import { PeerReviewStore } from '@requests/tasks/notification-peer-review/+state/peer-review.store';
import { PeerReviewDecisionSummaryComponent } from '@requests/tasks/notification-peer-review/peer-review-decision/peer-review-decision-summary/peer-review-decision-summary.component';

describe('PeerReviewDecisionSummaryComponent', () => {
  let component: PeerReviewDecisionSummaryComponent;
  let fixture: ComponentFixture<PeerReviewDecisionSummaryComponent>;
  let store: PeerReviewStore;
  let router: Router;
  const tasksService = mockClass(TasksService);
  tasksService.processRequestTaskAction.mockReturnValue(of({}) as any);
  const route = new ActivatedRouteStub();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeerReviewDecisionSummaryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TasksService, useValue: tasksService },
        { provide: ActivatedRoute, useValue: route },
        ...taskProviders,
      ],
    }).compileComponents();

    route.setUrl([new UrlSegment('/', {})]);
    store = TestBed.inject(PeerReviewStore);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(PeerReviewDecisionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display agreement text and notes when user agrees', () => {
    store.setDecision({
      accepted: true,
      isSubmitted: false,
      notes: 'agreement notes',
    });
    fixture.detectChanges();
    const ddElements: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('dd'));
    expect(ddElements.some((el) => el.textContent.trim() === 'I agree with the determination')).toEqual(true);
    expect(ddElements.some((el) => el.textContent.trim() === 'I do not agree with the determination')).toEqual(false);
    expect(ddElements.some((el) => el.textContent.trim() === 'agreement notes')).toEqual(true);
  });

  it('should display disagreement text and notes when user disagrees', () => {
    store.setDecision({
      accepted: false,
      isSubmitted: false,
      notes: 'disagreement notes',
    });
    fixture.detectChanges();
    const ddElements: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('dd'));
    expect(ddElements.some((el) => el.textContent.trim() === 'I agree with the determination')).toEqual(false);
    expect(ddElements.some((el) => el.textContent.trim() === 'I do not agree with the determination')).toEqual(true);
    expect(ddElements.some((el) => el.textContent.trim() === 'disagreement notes')).toEqual(true);
  });

  it('should redirect to success page when user completes the process', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    store.setDecision({
      accepted: true,
      isSubmitted: false,
      notes: 'test notes',
    });
    component.onSubmit();
    expect(store.select(selectIsDecisionSubmitted)()).toEqual(true);
    expect(navigateSpy).toHaveBeenCalledWith(['../success'], { relativeTo: route });
  });
});
