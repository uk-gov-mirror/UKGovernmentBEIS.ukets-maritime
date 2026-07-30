import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { taskProviders } from '@requests/common/task.providers';
import { PaymentNotCompletedComponent } from '@requests/tasks/payment/subtasks/not-completed/payment-not-completed/payment-not-completed.component';

describe('PaymentNotCompletedComponent', () => {
  class Page extends BasePage<PaymentNotCompletedComponent> {}

  let page: Page;
  let component: PaymentNotCompletedComponent;
  let fixture: ComponentFixture<PaymentNotCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentNotCompletedComponent],
      providers: [{ provide: ActivatedRoute, useValue: new ActivatedRouteStub() }, ...taskProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentNotCompletedComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show content', () => {
    expect(page.heading1.textContent).toEqual('The payment task must be closed before you can proceed');
  });
});
