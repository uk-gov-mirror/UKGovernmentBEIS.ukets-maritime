import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { AccountClosureConfirmationComponent } from '@requests/tasks/account-closure/components';
import { AccountClosureStateService } from '@requests/tasks/account-closure/services';

describe('AccountClosureConfirmationComponent', () => {
  let component: AccountClosureConfirmationComponent;
  let fixture: ComponentFixture<AccountClosureConfirmationComponent>;
  let page: Page;
  let router: Router;

  const activatedRoute = new ActivatedRouteStub({ accountId: 1 });
  const accountClosureStateService: MockType<AccountClosureStateService> = {
    submitAccountClosure: vi.fn().mockReturnValue(of([])),
  };

  class Page extends BasePage<AccountClosureConfirmationComponent> {
    get heading(): HTMLElement {
      return this.query<HTMLElement>('netz-page-heading');
    }

    get paragraphs(): HTMLParagraphElement[] {
      return this.queryAll<HTMLParagraphElement>('p');
    }

    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button');
    }
  }

  const createComponent = () => {
    fixture = TestBed.createComponent(AccountClosureConfirmationComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountClosureConfirmationComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AccountClosureStateService, useValue: accountClosureStateService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();
    createComponent();
  });

  it('should display all HTMLElements', () => {
    expect(component).toBeTruthy();
    expect(page.heading).toBeTruthy();
    expect(page.paragraphs).toHaveLength(2);
    expect(page.submitButton).toBeTruthy;
  });

  it('should submit and navigate to nextRoute', () => {
    const taskServiceSpy = vi.spyOn(accountClosureStateService, 'submitAccountClosure');
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['../success'], { relativeTo: activatedRoute });
  });
});
