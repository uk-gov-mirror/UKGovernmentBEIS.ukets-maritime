import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { ActivatedRouteStub, MockType } from '@netz/common/testing';

import { EmpTaskPayload } from '@requests/common/emp/emp.types';
import { SendApplicationSuccessComponent } from '@requests/common/emp/subtasks/send-application/send-application-success/send-application-success.component';
import { taskProviders } from '@requests/common/task.providers';

describe('SendApplicationSuccessComponent', () => {
  let component: SendApplicationSuccessComponent;
  let fixture: ComponentFixture<SendApplicationSuccessComponent>;

  const activatedRouteStub = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<EmpTaskPayload>> = {
    submit: vi.fn().mockReturnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendApplicationSuccessComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        ...taskProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SendApplicationSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
