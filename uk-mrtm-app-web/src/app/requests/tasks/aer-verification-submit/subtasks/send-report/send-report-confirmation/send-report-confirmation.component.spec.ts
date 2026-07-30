import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { AerVerificationSubmitTaskPayload } from '@requests/common/aer/aer.types';
import { taskProviders } from '@requests/common/task.providers';
import { SendReportConfirmationComponent } from '@requests/tasks/aer-verification-submit/subtasks/send-report/send-report-confirmation/send-report-confirmation.component';

describe('SendReportConfirmationComponent', () => {
  let component: SendReportConfirmationComponent;
  let fixture: ComponentFixture<SendReportConfirmationComponent>;
  let router: Router;
  let page: Page;

  const activatedRouteStub = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<AerVerificationSubmitTaskPayload>> = {
    submit: vi.fn().mockReturnValue(of({})),
  };

  const taskServiceSpy = vi.spyOn(taskServiceMock, 'submit');

  class Page extends BasePage<SendReportConfirmationComponent> {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SendReportConfirmationComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        ...taskProviders,
      ],
    });

    fixture = TestBed.createComponent(SendReportConfirmationComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct header and content', () => {
    expect(page.heading1.textContent).toEqual('Send verification report to the operator');
  });

  it('should submit task', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    page.standardButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['success'], { relativeTo: activatedRouteStub, skipLocationChange: true });
  });
});
