import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { ActivatedRouteStub } from '@netz/common/testing';

import { NotifyOperatorSuccessComponent } from '@requests/common/components/notify-operator/notify-operator-success/notify-operator-success.component';

describe('NotifyOperatorSuccessComponent', () => {
  let component: NotifyOperatorSuccessComponent;
  let fixture: ComponentFixture<NotifyOperatorSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotifyOperatorSuccessComponent],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: new ActivatedRouteStub() }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotifyOperatorSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
