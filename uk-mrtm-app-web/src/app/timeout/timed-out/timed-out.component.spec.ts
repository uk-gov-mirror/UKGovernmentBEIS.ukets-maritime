import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ActivatedRouteStub, mockClass } from '@netz/common/testing';

import { AuthService } from '@core/services/auth.service';
import { TimedOutComponent } from '@timeout/timed-out/timed-out.component';

describe('TimedOutComponent', () => {
  let component: TimedOutComponent;
  let fixture: ComponentFixture<TimedOutComponent>;
  const authService = mockClass(AuthService);
  const activatedRoute = new ActivatedRouteStub(null, { idle: 30 });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: APP_BASE_HREF, useValue: '/maritime/' },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimedOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sign in again on button click', () => {
    const loginSpy = vi.spyOn(authService, 'login');
    const button = fixture.nativeElement.querySelector('button');

    button.click();

    expect(loginSpy).toHaveBeenCalledTimes(1);
  });

  it('should show idle time properly', () => {
    const message = fixture.nativeElement.querySelector('.govuk-body').innerHTML;
    expect(message).toContain('We have reset your session because you did not do anything for less than a minute .');
  });
});
