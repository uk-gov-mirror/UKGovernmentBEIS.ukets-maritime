import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { of, throwError } from 'rxjs';

import { UsersSecuritySetupService } from '@mrtm/api';

import { ErrorCodes } from '@netz/common/error';
import { ActivatedRouteStub, mockClass } from '@netz/common/testing';

import { AuthService } from '@core/services/auth.service';
import { Delete2faComponent } from '@two-fa/delete-2fa/delete-2fa.component';

describe('Delete2faComponent', () => {
  let component: Delete2faComponent;
  let fixture: ComponentFixture<Delete2faComponent>;
  let router: Router;

  const activatedRouteStub = new ActivatedRouteStub(null, { token: 'token' });
  const usersSecuritySetupService = mockClass(UsersSecuritySetupService);
  const authService = mockClass(AuthService);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Delete2faComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: UsersSecuritySetupService, useValue: usersSecuritySetupService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Delete2faComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    usersSecuritySetupService.deleteOtpCredentials.mockReturnValue(of({} as any));
    fixture.detectChanges();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should logout user after successful 2fa deletion', () => {
    usersSecuritySetupService.deleteOtpCredentials.mockReturnValue(of({} as any));
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.ngOnInit();

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should navigate for link related error', () => {
    usersSecuritySetupService.deleteOtpCredentials.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: { code: ErrorCodes.EMAIL1001 }, status: 400 })),
    );
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.ngOnInit();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['2fa', 'invalid-link'], {
      queryParams: { code: ErrorCodes.EMAIL1001 },
    });
  });
});
