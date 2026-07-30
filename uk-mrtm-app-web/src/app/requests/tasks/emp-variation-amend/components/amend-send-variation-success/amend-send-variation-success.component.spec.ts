import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { EmpVariationTaskPayload } from '@requests/common/emp/emp.types';
import { taskProviders } from '@requests/common/task.providers';
import { AmendSendVariationSuccessComponent } from '@requests/tasks/emp-variation-amend/components/amend-send-variation-success/amend-send-variation-success.component';

describe('AmendSendVariationSuccessComponent', () => {
  let component: AmendSendVariationSuccessComponent;
  let fixture: ComponentFixture<AmendSendVariationSuccessComponent>;
  let page: Page;

  const activatedRouteStub = new ActivatedRouteStub();
  const taskServiceMock: MockType<TaskService<EmpVariationTaskPayload>> = {
    submit: vi.fn().mockReturnValue(of({})),
  };

  class Page extends BasePage<AmendSendVariationSuccessComponent> {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AmendSendVariationSuccessComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        ...taskProviders,
      ],
    });

    fixture = TestBed.createComponent(AmendSendVariationSuccessComponent);
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
