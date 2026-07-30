import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { mockRequestTask } from '@netz/common/request-task';
import { RequestTaskStore } from '@netz/common/store';
import { ActivatedRouteStub, BasePage, RouterStubComponent } from '@netz/common/testing';

import { RequestNotAllowedComponent } from '@requests/common/emp/components/request-not-allowed';
import { taskProviders } from '@requests/common/task.providers';

describe('RequestNotAllowedComponent', () => {
  let component: RequestNotAllowedComponent;
  let fixture: ComponentFixture<RequestNotAllowedComponent>;
  let page: Page;
  let router: Router;
  let store: RequestTaskStore;

  class Page extends BasePage<RequestNotAllowedComponent> {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequestNotAllowedComponent],
      providers: [
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        ...taskProviders,
        provideRouter([{ path: 'tasks/:id', component: RouterStubComponent }]),
      ],
    });

    router = TestBed.inject(Router);
    store = TestBed.inject(RequestTaskStore);
    store.setState({
      ...mockRequestTask,
      relatedTasks: [
        {
          taskType: 'EMP_VARIATION_WAIT_FOR_RFI_RESPONSE',
          creationDate: '2024-12-20T07:06:12.30081Z',
          taskId: 100,
        },
      ],
    });
    fixture = TestBed.createComponent(RequestNotAllowedComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display HTML Elements', () => {
    expect(page.heading1.textContent).toEqual('You can only have one active request at any given time.');
    expect(page.standardButton.textContent).toEqual('View the active request');
  });

  it('should navigate to related task when click on button', () => {
    const routerSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    page.standardButton.click();

    expect(routerSpy).toHaveBeenCalledWith(['/tasks', 100]);
  });
});
