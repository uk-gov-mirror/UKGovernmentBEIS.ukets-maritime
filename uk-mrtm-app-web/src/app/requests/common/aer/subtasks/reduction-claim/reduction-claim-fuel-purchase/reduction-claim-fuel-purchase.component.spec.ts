import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { RequestTaskAttachmentsHandlingService } from '@mrtm/api';

import { TaskService } from '@netz/common/forms';
import { ActivatedRouteStub, asyncData, MockType } from '@netz/common/testing';

import { ReductionClaimFuelPurchaseComponent } from '@requests/common/aer/subtasks/reduction-claim/reduction-claim-fuel-purchase';
import { taskProviders } from '@requests/common/task.providers';

describe('ReductionClaimFuelPurchaseComponent', () => {
  let component: ReductionClaimFuelPurchaseComponent;
  let fixture: ComponentFixture<ReductionClaimFuelPurchaseComponent>;
  const taskServiceMock: MockType<TaskService<any>> = {};
  const uuid4 = '44444444-4444-4444-a444-444444444444';
  const attachmentService: MockType<RequestTaskAttachmentsHandlingService> = {
    uploadRequestTaskAttachment: vi.fn().mockReturnValue(asyncData<any>(new HttpResponse({ body: { uuid: uuid4 } }))),
  };

  const getFixedUUID = vi.fn().mockReturnValue(uuid4);
  Object.defineProperty(window, 'crypto', {
    value: { getRandomValues: getFixedUUID, randomUUID: getFixedUUID },
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReductionClaimFuelPurchaseComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: RequestTaskAttachmentsHandlingService, useValue: attachmentService },
        ...taskProviders,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReductionClaimFuelPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
