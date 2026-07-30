import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { of } from 'rxjs';

import { UsersService } from '@mrtm/api';

import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { FeedbackComponent } from '@feedback/feedback.component';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;
  let router: Router;

  const activatedRoute = new ActivatedRouteStub();
  const usersService: MockType<UsersService> = {
    provideUserFeedback: vi.fn().mockReturnValue(of(null)),
  };
  let page: Page;

  class Page extends BasePage<FeedbackComponent> {
    get userRegistrationRateRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="userRegistrationRate"]');
    }

    set userRegistrationRateReason(value: string) {
      this.setInputValue('#userRegistrationRateReason', value);
    }

    get onlineGuidanceRateRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="onlineGuidanceRate"]');
    }

    set onlineGuidanceRateReason(value: string) {
      this.setInputValue('#onlineGuidanceRateReason', value);
    }

    get creatingAccountRateRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="creatingAccountRate"]');
    }

    get onBoardingRateRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="onBoardingRate"]');
    }

    get tasksRateRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="tasksRate"]');
    }

    get satisfactionRateRadios() {
      return this.queryAll<HTMLInputElement>('input[name$="satisfactionRate"]');
    }

    set improvementSuggestion(value: string) {
      this.setInputValue('#improvementSuggestion', value);
    }

    get submitButton(): HTMLButtonElement {
      return this.query('button[type="submit"]');
    }

    get errorSummary(): HTMLDivElement {
      return this.query('.govuk-error-summary');
    }

    get errorSummaryErrorList() {
      return Array.from(this.query<HTMLDivElement>('.govuk-error-summary').querySelectorAll('a')).map((anchor) =>
        anchor.textContent.trim(),
      );
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), FeedbackComponent],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
  });

  afterEach(() => vi.clearAllMocks());

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send feedback form', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    expect(page.userRegistrationRateRadios.length).toEqual(5);
    expect(page.onlineGuidanceRateRadios.length).toEqual(6);
    expect(page.creatingAccountRateRadios.length).toEqual(6);
    expect(page.onBoardingRateRadios.length).toEqual(6);
    expect(page.tasksRateRadios.length).toEqual(6);
    expect(page.satisfactionRateRadios.length).toEqual(5);

    expect(page.errorSummary).toBeFalsy();

    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryErrorList).toEqual([
      'Select a rating for user registration',
      'Select a rating for online guidance and communication',
      'Select a rating for claiming an account',
      'Select a rating for on-boarding, identity and security checks',
      'Select a rating for viewing, searching and responding to tasks',
      'Select a rating for overall experience with this service so far',
    ]);
    expect(navigateSpy).toHaveBeenCalledTimes(0);

    page.userRegistrationRateRadios[4].click();
    page.userRegistrationRateReason = 'bad UX';

    page.onlineGuidanceRateRadios[5].click();
    page.onlineGuidanceRateReason = 'no idea';

    page.creatingAccountRateRadios[5].click();
    page.onBoardingRateRadios[5].click();
    page.tasksRateRadios[5].click();
    page.satisfactionRateRadios[4].click();

    page.improvementSuggestion = 'fix UX';

    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeFalsy();
    expect(usersService.provideUserFeedback).toHaveBeenCalledTimes(1);
    expect(usersService.provideUserFeedback).toHaveBeenCalledWith({
      userRegistrationRate: 'VERY_DISSATISFIED',
      userRegistrationRateReason: 'bad UX',

      onlineGuidanceRate: 'NOT_APPLICABLE_NOT_USED_YET',
      onlineGuidanceRateReason: 'no idea',

      creatingAccountRate: 'NOT_APPLICABLE_NOT_USED_YET',
      creatingAccountRateReason: null,

      onBoardingRate: 'NOT_APPLICABLE_NOT_USED_YET',
      onBoardingRateReason: null,

      tasksRate: 'NOT_APPLICABLE_NOT_USED_YET',
      tasksRateReason: null,

      satisfactionRate: 'VERY_DISSATISFIED',
      satisfactionRateReason: null,

      improvementSuggestion: 'fix UX',
    });
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['sent'], { relativeTo: activatedRoute });
  });
});
