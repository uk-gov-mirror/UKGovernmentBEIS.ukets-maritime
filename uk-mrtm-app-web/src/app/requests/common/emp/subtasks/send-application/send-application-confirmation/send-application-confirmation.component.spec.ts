import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { SendApplicationConfirmationComponent } from '@requests/common/emp/subtasks/send-application/send-application-confirmation/send-application-confirmation.component';
import { taskProviders } from '@requests/common/task.providers';

describe('SendApplicationConfirmationComponent', () => {
  let component: SendApplicationConfirmationComponent;
  let fixture: ComponentFixture<SendApplicationConfirmationComponent>;
  let router: Router;
  let page: Page;

  const activatedRouteStub = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<EmpTaskPayload>> = {
    submit: vi.fn().mockReturnValue(of({})),
  };

  const taskServiceSpy = vi.spyOn(taskServiceMock, 'submit');

  class Page extends BasePage<SendApplicationConfirmationComponent> {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendApplicationConfirmationComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        ...taskProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SendApplicationConfirmationComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct header and content', () => {
    expect(page.heading1.textContent).toEqual('Send application to regulator');
  });

  it('should submit task', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    page.standardButton.click();
    fixture.detectChanges();
    expect(taskServiceSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['success'], { relativeTo: activatedRouteStub, skipLocationChange: true });
  });
});
