import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { ActivatedRouteStub, MockType } from '@netz/common/testing';

import { EmpAmendTaskPayload } from '@requests/common/emp/emp.types';
import { AMENDS_NEEDED_GROUPS } from '@requests/common/emp/return-for-amends';
import { RequestedChangesQuestionComponent } from '@requests/common/emp/subtasks/requested-changes';
import { taskProviders } from '@requests/common/task.providers';

describe('RequestedChangesQuestionComponent', () => {
  let component: RequestedChangesQuestionComponent;
  let fixture: ComponentFixture<RequestedChangesQuestionComponent>;

  const taskServiceMock: MockType<TaskService<EmpAmendTaskPayload>> = {
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestedChangesQuestionComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: AMENDS_NEEDED_GROUPS, useValue: signal([]) },
        ...taskProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestedChangesQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
