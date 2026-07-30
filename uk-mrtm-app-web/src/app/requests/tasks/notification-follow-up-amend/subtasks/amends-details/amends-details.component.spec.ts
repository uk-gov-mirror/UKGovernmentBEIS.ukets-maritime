import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { MockType } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { FollowUpAmendTaskPayload } from '@requests/tasks/notification-follow-up-amend/follow-up-amend.types';
import { AmendsDetailsComponent } from '@requests/tasks/notification-follow-up-amend/subtasks/amends-details/amends-details.component';

describe('AmendsDetailsComponent', () => {
  let component: AmendsDetailsComponent;
  let fixture: ComponentFixture<AmendsDetailsComponent>;
  let store: RequestTaskStore;

  const taskServiceMock: MockType<TaskService<FollowUpAmendTaskPayload>> = {
    submitSubtask: vi.fn().mockReturnValue(of(true)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmendsDetailsComponent],
      providers: [{ provide: TaskService, useValue: taskServiceMock }, ...taskProviders, provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(RequestTaskStore);
    store.setRequestTaskItem({
      requestTask: {
        id: 1,
      },
    });
    fixture = TestBed.createComponent(AmendsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
