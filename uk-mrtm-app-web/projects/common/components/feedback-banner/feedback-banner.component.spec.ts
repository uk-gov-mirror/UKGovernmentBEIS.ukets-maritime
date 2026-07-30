import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ActivatedRouteStub } from '@netz/common/testing';

import { FeedbackBannerComponent } from './feedback-banner.component';
import { FeedbackBannerStore } from './feedback-banner.store';

describe('FeedbackBannerComponent', () => {
  let component: FeedbackBannerComponent;
  let fixture: ComponentFixture<FeedbackBannerComponent>;
  let store: FeedbackBannerStore;

  beforeEach(async () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    await TestBed.configureTestingModule({
      imports: [FeedbackBannerComponent],
      providers: [{ provide: ActivatedRoute, useValue: new ActivatedRouteStub() }],
    }).compileComponents();

    store = TestBed.inject(FeedbackBannerStore);

    fixture = TestBed.createComponent(FeedbackBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the neutral banner', () => {
    store.setNeutralBanner({
      heading: 'Task is in progress',
      body: 'The task is processing in the background. Once this is complete it will be removed from your task list',
    });
    fixture.detectChanges();

    const banner = (fixture.nativeElement as HTMLElement).querySelector('govuk-notification-banner');
    expect(banner.querySelector('.govuk-notification-banner__title').textContent.trim()).toEqual('Important');
    expect(banner.querySelector('.govuk-notification-banner__heading').textContent.trim()).toEqual(
      'Task is in progress',
    );
    expect(banner.querySelector('.govuk-body').textContent.trim()).toEqual(
      'The task is processing in the background. Once this is complete it will be removed from your task list',
    );
  });
});
