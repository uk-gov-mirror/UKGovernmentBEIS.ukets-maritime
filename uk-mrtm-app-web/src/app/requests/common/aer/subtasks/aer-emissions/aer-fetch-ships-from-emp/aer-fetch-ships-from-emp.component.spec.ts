import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { BasePage, MockType } from '@netz/common/testing';

import { TaskItemStatus } from '@requests/common';
import { AerFetchShipsFromEmpComponent } from '@requests/common/aer/subtasks/aer-emissions/aer-fetch-ships-from-emp/aer-fetch-ships-from-emp.component';
import { aerEmissionsMap } from '@requests/common/aer/subtasks/aer-subtasks-list.map';
import { aerEmissionsMock, mockAerStateBuild } from '@requests/common/aer/testing';
import { taskProviders } from '@requests/common/task.providers';

describe('AerFetchShipsFromEmpComponent', () => {
  let component: AerFetchShipsFromEmpComponent;
  let fixture: ComponentFixture<AerFetchShipsFromEmpComponent>;
  let page: Page;
  let store: RequestTaskStore;

  const taskService: MockType<any> = {
    fetchShipsFromEMP: vi.fn().mockReturnValue(of({})),
    saveSubtask: vi.fn().mockReturnValue(of({})),
  };

  const taskServiceSpy = vi.spyOn(taskService, 'fetchShipsFromEMP');

  class Page extends BasePage<AerFetchShipsFromEmpComponent> {
    get warnText(): HTMLElement {
      return this.query<HTMLElement>('strong');
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AerFetchShipsFromEmpComponent],
      providers: [provideRouter([]), { provide: TaskService, useValue: taskService }, ...taskProviders],
    });

    store = TestBed.inject(RequestTaskStore);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(AerFetchShipsFromEmpComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTML elements', () => {
    expect(page.heading1.textContent).toEqual(aerEmissionsMap.fetchFromEMP.title);
    expect(page.standardButton.textContent).toEqual('Yes, import ships from EMP');
    expect(page.link.textContent).toEqual('Return to: Add ships and emission details');
  });

  it('should display warning text', () => {
    store.setState(mockAerStateBuild({ emissions: aerEmissionsMock }, { emissions: TaskItemStatus.COMPLETED }));
    fixture.detectChanges();

    expect(page.warnText.textContent).toEqual(
      'If you import the ships from the Emissions Monitoring Plan (EMP), all of the data that has been entered will be replaced.',
    );
  });

  it('should trigger fetch ships from EMP', () => {
    page.standardButton.click();
    fixture.detectChanges();

    expect(taskServiceSpy).toHaveBeenCalledTimes(1);
  });
});
