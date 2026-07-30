import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { of } from 'rxjs';

import {
  ItemDTOResponse,
  ItemsAssignedToMeService,
  ItemsAssignedToOthersService,
  MaritimeAccountsService,
  UnassignedItemsService,
} from '@mrtm/api';

import { AuthStore } from '@netz/common/auth';
import { BasePage } from '@netz/common/testing';

import { DashboardStore } from '@shared/dashboard/+store';
import { DashboardPageComponent } from '@shared/dashboard/containers';
import { WorkflowItemsService } from '@shared/dashboard/services';
import { Mocked } from 'vitest';

class Page extends BasePage<DashboardPageComponent> {
  get assignedToOthersTabLink() {
    return this.query<HTMLAnchorElement>('#tab_assigned-to-others');
  }

  get unassignedTabLink() {
    return this.query<HTMLAnchorElement>('#tab_unassigned');
  }

  get assignedToMeTab() {
    return this.query<HTMLDivElement>('#assigned-to-me');
  }

  get assignedToOthersTab() {
    return this.query<HTMLDivElement>('#assigned-to-others');
  }

  get unassignedTab() {
    return this.query<HTMLDivElement>('#unassigned');
  }
}

describe('DashboardPageComponent', () => {
  let authStore: AuthStore;
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let page: Page;
  let itemsAssignedToMeService: Partial<Mocked<ItemsAssignedToMeService>>;
  let itemsAssignedToOthersService: Partial<Mocked<ItemsAssignedToOthersService>>;
  let unassignedItemsService: Partial<Mocked<UnassignedItemsService>>;
  let maritimeAccountsService: Partial<Mocked<MaritimeAccountsService>>;

  const mockTasks: ItemDTOResponse = {
    items: [
      {
        taskAssigneeType: 'REGULATOR',
        daysRemaining: null,
        taskAssignee: null,
        creationDate: new Date('2020-11-13T13:00:00Z').toISOString(),
        requestId: '1',
        taskId: 2,
        isNew: true,
      },
      {
        taskAssigneeType: 'OPERATOR',
        daysRemaining: 13,
        taskAssignee: { firstName: 'Sasha', lastName: 'Baron Cohen' },
        creationDate: new Date('2020-11-13T15:00:00Z').toISOString(),
        requestId: '3',
        taskId: 4,
        isNew: false,
      },
    ],
    totalItems: 2,
  };
  const unassignedItems: ItemDTOResponse = {
    items: [
      {
        taskAssigneeType: 'REGULATOR',
        creationDate: new Date('2020-11-27T10:13:49Z').toISOString(),
        requestId: '40',
        taskId: 19,
        daysRemaining: 3,
      },
    ],
    totalItems: 1,
  };

  const createComponent = () => {
    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    itemsAssignedToMeService = {
      getAssignedItems: vi.fn().mockReturnValue(of(mockTasks)),
    };
    itemsAssignedToOthersService = {
      getAssignedToOthersItems: vi
        .fn()
        .mockReturnValue(of({ items: mockTasks.items.slice(1, 2), totalPages: mockTasks.totalItems })),
    };
    unassignedItemsService = {
      getUnassignedItems: vi.fn().mockReturnValue(of(unassignedItems)),
    };
    maritimeAccountsService = {
      getMrtmAccountsInfoByUser: vi.fn().mockReturnValue(of([])),
    };
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        WorkflowItemsService,
        DashboardStore,
        { provide: ItemsAssignedToMeService, useValue: itemsAssignedToMeService },
        { provide: ItemsAssignedToOthersService, useValue: itemsAssignedToOthersService },
        { provide: UnassignedItemsService, useValue: unassignedItemsService },
        { provide: MaritimeAccountsService, useValue: maritimeAccountsService },
      ],
    }).compileComponents();

    authStore = TestBed.inject(AuthStore);
  });

  beforeEach(createComponent);

  describe('for operators', () => {
    beforeEach(() => {
      authStore.setUserState({ roleType: 'OPERATOR', userId: '331' });
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render assigned to me table rows', () => {
      fixture.detectChanges();

      const anchors = Array.from(page.assignedToMeTab.querySelectorAll('td'))
        .map((cell) => cell.querySelector('a'))
        .filter((anchor) => !!anchor);
      expect(anchors.map((anchor) => anchor.href).length).toEqual(2);
    });

    it('should render assigned to others table rows', async () => {
      page.assignedToOthersTabLink.click();
      await fixture.whenStable();
      fixture.detectChanges();

      const anchors = Array.from(page.assignedToOthersTab.querySelectorAll('td'))
        .map((cell) => cell.querySelector('a'))
        .filter((anchor) => !!anchor);
      expect(anchors.map((anchor) => anchor.href).length).toEqual(1);
    });

    it('should not display the unassigned items', () => {
      expect(page.unassignedTabLink).toBeFalsy();
    });

    it('should reset the page when the workflow type filter changes', async () => {
      const store = TestBed.inject(DashboardStore);

      component.changePage(3);
      await fixture.whenStable();

      expect(itemsAssignedToMeService.getAssignedItems).toHaveBeenLastCalledWith(
        2,
        10,
        expect.objectContaining({ requestType: null }),
      );

      store.setFilters({ accountId: null, workflowType: 'AER', orderBy: 'NEWEST_FIRST' });
      await fixture.whenStable();

      expect(component.page()).toEqual(1);
      expect(itemsAssignedToMeService.getAssignedItems).toHaveBeenLastCalledWith(
        0,
        10,
        expect.objectContaining({ requestType: 'AER' }),
      );
    });
  });

  describe('for regulators', () => {
    beforeEach(() => {
      authStore.setUserState({ roleType: 'REGULATOR', userId: '332' });
      fixture.detectChanges();
    });

    it('should display the unassigned items', async () => {
      expect(page.unassignedTabLink).toBeTruthy();
      page.unassignedTabLink.click();
      await fixture.whenStable();
      fixture.detectChanges();

      const anchors = Array.from(page.unassignedTab.querySelectorAll('td'))
        .map((cell) => cell.querySelector('a'))
        .filter((anchor) => !!anchor);
      expect(anchors.map((anchor) => anchor.href).length).toEqual(1);
    });
  });

  describe('for verifiers', () => {
    beforeEach(() => {
      authStore.setUserState({ roleType: 'VERIFIER', userId: '332' });
      fixture.detectChanges();
    });

    it('should allow view of unassigned items', () => {
      expect(page.unassignedTabLink).toBeTruthy();
    });
  });
});
