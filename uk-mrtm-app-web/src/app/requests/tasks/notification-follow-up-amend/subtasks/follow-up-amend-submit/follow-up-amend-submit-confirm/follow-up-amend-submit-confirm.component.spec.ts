import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router, UrlSegment } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { FollowUpService } from '@requests/tasks/notification-follow-up/services';
import { FollowUpAmendSubmitConfirmComponent } from '@requests/tasks/notification-follow-up-amend/subtasks/follow-up-amend-submit/follow-up-amend-submit-confirm/follow-up-amend-submit-confirm.component';

describe('FollowUpAmendSubmitConfirmComponent', () => {
  let component: FollowUpAmendSubmitConfirmComponent;
  let fixture: ComponentFixture<FollowUpAmendSubmitConfirmComponent>;
  let page: Page;
  let router: Router;

  const route = new ActivatedRouteStub();
  const taskService: MockType<FollowUpService> = {
    submit: vi.fn().mockReturnValue(of({})),
  };
  const taskServiceSpy = vi.spyOn(taskService, 'submit');

  @Component({
    standalone: true,
    template: '',
  })
  class NoopComponent {}

  class Page extends BasePage<FollowUpAmendSubmitConfirmComponent> {
    get paragraphs(): HTMLParagraphElement[] {
      return this.queryAll<HTMLParagraphElement>('p');
    }

    get submitButton(): HTMLButtonElement {
      return this.query<HTMLButtonElement>('button[type="button"]');
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowUpAmendSubmitConfirmComponent],
      providers: [
        provideRouter([{ path: 'success', component: NoopComponent }]),
        { provide: TaskService, useValue: taskService },
        { provide: ActivatedRoute, useValue: route },
        ...taskProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FollowUpAmendSubmitConfirmComponent);
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
