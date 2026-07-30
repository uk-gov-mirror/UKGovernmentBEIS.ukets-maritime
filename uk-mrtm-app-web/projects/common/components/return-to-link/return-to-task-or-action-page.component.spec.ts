import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { ITEM_TYPE_TO_RETURN_TEXT_MAPPER, RequestTaskStore, TYPE_AWARE_STORE } from '@netz/common/store';
import { BasePage } from '@netz/common/testing';

import { ReturnToTaskOrActionPageComponent } from './return-to-task-or-action-page.component';

describe('ReturnToTaskOrActionPageComponent', () => {
  let store: RequestTaskStore;
  let component: ReturnToTaskOrActionPageComponent;
  let harness: RouterTestingHarness;
  let page: Page;

  class Page extends BasePage<ReturnToTaskOrActionPageComponent> {}

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'tasks',
            children: [
              {
                path: ':taskId',
                children: [{ path: 'subtask', component: ReturnToTaskOrActionPageComponent }],
              },
            ],
          },
        ]),
        { provide: TYPE_AWARE_STORE, useExisting: RequestTaskStore },
        { provide: ITEM_TYPE_TO_RETURN_TEXT_MAPPER, useValue: () => 'TEST RETURN' },
      ],
    }).overrideComponent(ReturnToTaskOrActionPageComponent, {
      set: { host: { 'test-id': 'ReturnToTaskOrActionPageComponent' } },
    });

    store = TestBed.inject(RequestTaskStore);
    store.setRequestTaskItem({ requestTask: { type: 'TEST_TYPE' as any } });

    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/tasks/1/subtask', ReturnToTaskOrActionPageComponent);
    page = new Page(harness.fixture as any);
    harness.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct link and text', () => {
    expect(page.link.href).toEqual('http://localhost:3000/tasks/1');
    expect(page.link.innerHTML.trim()).toEqual('Return to: TEST RETURN');
  });
});
