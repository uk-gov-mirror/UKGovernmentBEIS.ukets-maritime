import { TestBed } from '@angular/core/testing';

import { firstValueFrom, of } from 'rxjs';

import {
  ItemsAssignedToMeService,
  ItemsAssignedToOthersService,
  ItemSearchCriteriaDTO,
  UnassignedItemsService,
} from '@mrtm/api';

import { WorkflowItemsService } from '@shared/dashboard';

describe('WorkflowItemsService', () => {
  let service: WorkflowItemsService;

  const itemsAssignedToMeService = {
    getAssignedItems: vi.fn().mockReturnValue(of({})),
  };
  const itemsAssignedToOthersService = {
    getAssignedToOthersItems: vi.fn().mockReturnValue(of({})),
  };
  const unassignedItemsService = {
    getUnassignedItems: vi.fn().mockReturnValue(of({})),
  };

  const searchCriteria: ItemSearchCriteriaDTO = {
    orderBy: 'NEWEST_FIRST',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkflowItemsService,
        { provide: ItemsAssignedToMeService, useValue: itemsAssignedToMeService },
        { provide: ItemsAssignedToOthersService, useValue: itemsAssignedToOthersService },
        { provide: UnassignedItemsService, useValue: unassignedItemsService },
      ],
    });
    service = TestBed.inject(WorkflowItemsService);
  });

  afterEach(() => {
    itemsAssignedToMeService.getAssignedItems.mockClear();
    itemsAssignedToOthersService.getAssignedToOthersItems.mockClear();
    unassignedItemsService.getUnassignedItems.mockClear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call assigned-to-me service method with appropriate account type', async () => {
    await firstValueFrom(service.getItems('assigned-to-me', 1, 10, 'NEWEST_FIRST'));
    expect(itemsAssignedToMeService.getAssignedItems).toHaveBeenCalledWith(0, 10, searchCriteria);
    expect(itemsAssignedToOthersService.getAssignedToOthersItems).not.toHaveBeenCalled();
    expect(unassignedItemsService.getUnassignedItems).not.toHaveBeenCalled();
  });

  it('should call assigned-to-others service method with appropriate account type', async () => {
    await firstValueFrom(service.getItems('assigned-to-others', 1, 10, 'NEWEST_FIRST'));
    expect(itemsAssignedToOthersService.getAssignedToOthersItems).toHaveBeenCalledWith(0, 10, searchCriteria);
    expect(itemsAssignedToMeService.getAssignedItems).not.toHaveBeenCalled();
    expect(unassignedItemsService.getUnassignedItems).not.toHaveBeenCalled();
  });

  it('should call unassigned service method with appropriate account type', async () => {
    await firstValueFrom(service.getItems('unassigned', 1, 10, 'NEWEST_FIRST'));
    expect(unassignedItemsService.getUnassignedItems).toHaveBeenCalledWith(0, 10, searchCriteria);
    expect(itemsAssignedToMeService.getAssignedItems).not.toHaveBeenCalled();
    expect(itemsAssignedToOthersService.getAssignedToOthersItems).not.toHaveBeenCalled();
  });
});
