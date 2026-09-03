import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorDetailsHistoryComponent } from '@accounts/containers/operator-details-history/operator-details-history.component';

describe('OperatorDetailsHistoryComponent', () => {
  let component: OperatorDetailsHistoryComponent;
  let fixture: ComponentFixture<OperatorDetailsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorDetailsHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperatorDetailsHistoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
