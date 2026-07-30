import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router, UrlSegment } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { NotificationService } from '@requests/tasks/notification-submit/services';
import { SubmitNotificationToRegulatorConfirmComponent } from '@requests/tasks/notification-submit/subtasks/submit-notification-to-regulator/submit-notification-to-regulator-confirm/submit-notification-to-regulator-confirm.component';

describe('SubmitNotificationToRegulatorConfirmComponent', () => {
  let component: SubmitNotificationToRegulatorConfirmComponent;
  let fixture: ComponentFixture<SubmitNotificationToRegulatorConfirmComponent>;
  let page: Page;
  let router: Router;

  const route = new ActivatedRouteStub();
  const taskService: MockType<NotificationService> = {
    submit: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'submit');

  @Component({
    standalone: true,
    template: '',
  })
  class NoopComponent {}

  class Page extends BasePage<SubmitNotificationToRegulatorConfirmComponent> {
    get paragraphs(): HTMLParagraphElement[] {
      return this.queryAll<HTMLParagraphElement>('p');
    }

    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitNotificationToRegulatorConfirmComponent],
      providers: [
        provideRouter([{ path: 'success', component: NoopComponent }]),
        { provide: TaskService, useValue: taskService },
        { provide: ActivatedRoute, useValue: route },
        ...taskProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitNotificationToRegulatorConfirmComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    router = TestBed.inject(Router);
    route.setUrl([new UrlSegment('/', {})]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.heading1).toBeTruthy();
    expect(page.heading1.textContent).toEqual('Submit to regulator');
    expect(page.paragraphs).toHaveLength(2);
  });

  it('should submit subtask', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    page.submitButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['success'], { skipLocationChange: true, relativeTo: route });
  });
});
