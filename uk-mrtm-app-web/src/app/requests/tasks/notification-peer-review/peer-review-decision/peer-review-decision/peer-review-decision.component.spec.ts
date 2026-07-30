import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';

import { ActivatedRouteStub } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { initialPeerReviewDecisionState } from '@requests/tasks/notification-peer-review/+state/peer-review.state';
import { PeerReviewStore } from '@requests/tasks/notification-peer-review/+state/peer-review.store';
import { PeerReviewDecisionComponent } from '@requests/tasks/notification-peer-review/peer-review-decision/peer-review-decision/peer-review-decision.component';

describe('PeerReviewDecisionComponent', () => {
  let component: PeerReviewDecisionComponent;
  let fixture: ComponentFixture<PeerReviewDecisionComponent>;
  let router: Router;
  let store: PeerReviewStore;
  const route = new ActivatedRouteStub();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeerReviewDecisionComponent],
      providers: [{ provide: ActivatedRoute, useValue: route }, ...taskProviders],
    }).compileComponents();

    store = TestBed.inject(PeerReviewStore);
    router = TestBed.inject(Router);
    route.setUrl([new UrlSegment('/', {})]);
    fixture = TestBed.createComponent(PeerReviewDecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not proceed to summary if form is empty', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();

    const errorSummary = fixture.debugElement.query(By.css('.govuk-error-summary'));
    expect(errorSummary).toBeTruthy();

    const errorMessages = errorSummary.queryAll(By.css('a'));
    expect(errorMessages.some((message) => message.nativeElement.text.trim() === 'Enter an assessment')).toEqual(true);
    expect(errorMessages.some((message) => message.nativeElement.text.trim() === 'Enter notes')).toEqual(true);

    expect(store.state.decision).toEqual(initialPeerReviewDecisionState);
  });

  it('should proceed to summary if form filled correctly', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.setValue({
      accepted: true,
      notes: 'test notes',
    });
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    fixture.detectChanges();

    expect(component.form.valid).toBe(true);

    const errorSummary = fixture.debugElement.query(By.css('.govuk-error-summary'));
    expect(errorSummary).toBeFalsy();

    expect(store.state.decision).toEqual({
      accepted: true,
      notes: 'test notes',
      isSubmitted: false,
    });

    expect(navigateSpy).toHaveBeenCalledWith(['summary'], { relativeTo: route });
  });
});
