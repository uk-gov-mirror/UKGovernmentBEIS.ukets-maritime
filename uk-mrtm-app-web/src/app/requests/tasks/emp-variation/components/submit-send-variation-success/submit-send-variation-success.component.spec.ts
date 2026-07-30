import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { EmpVariationTaskPayload } from '@requests/common/emp/emp.types';
import { taskProviders } from '@requests/common/task.providers';
import { SubmitSendVariationSuccessComponent } from '@requests/tasks/emp-variation/components/submit-send-variation-success/submit-send-variation-success.component';

describe('SubmitSendVariationSuccessComponent', () => {
  let component: SubmitSendVariationSuccessComponent;
  let fixture: ComponentFixture<SubmitSendVariationSuccessComponent>;
  let page: Page;

  const activatedRouteStub = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<EmpVariationTaskPayload>> = {
    submit: vi.fn().mockReturnValue(of({})),
  };

  class Page extends BasePage<SubmitSendVariationSuccessComponent> {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubmitSendVariationSuccessComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        ...taskProviders,
      ],
    });

    fixture = TestBed.createComponent(SubmitSendVariationSuccessComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct header and content', () => {
    expect(page.heading1.textContent).toEqual('Variation application sent to regulator');
  });
});
