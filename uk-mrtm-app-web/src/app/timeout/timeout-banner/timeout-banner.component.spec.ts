import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { mockClass } from '@netz/common/testing';

import { AuthService, KeycloakService } from '@core/services';
import { TimeoutBannerComponent } from '@timeout/timeout-banner/timeout-banner.component';
import { TimeoutBannerService } from '@timeout/timeout-banner/timeout-banner.service';

describe('TimeoutBannerComponent', () => {
  let component: TimeoutBannerComponent;
  let fixture: ComponentFixture<TimeoutBannerComponent>;
  let timeoutBannerService: TimeoutBannerService;

  beforeEach(async () => {
    const keycloakServiceMock = mockClass(KeycloakService);
    const authServiceMock = mockClass(AuthService);

    (keycloakServiceMock.keycloakEvents as any) = signal(null);
    (keycloakServiceMock.updateToken as any) = vi.fn().mockResolvedValue(true);
    Object.defineProperty(keycloakServiceMock, 'keycloakInstance', {
      value: {},
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [TimeoutBannerComponent],
      providers: [
        { provide: KeycloakService, useValue: keycloakServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        TimeoutBannerService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeoutBannerComponent);
    component = fixture.componentInstance;
    timeoutBannerService = TestBed.inject(TimeoutBannerService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open dialog when isVisible signal is set to true', () => {
    fixture.detectChanges();
    timeoutBannerService.isVisible.set(true);
    fixture.detectChanges();
    expect(component.isDialogOpen()).toBeTruthy();
  });

  it('should close dialog when isVisible signal is set to false', () => {
    timeoutBannerService.isVisible.set(true);
    fixture.detectChanges();
    expect(component.isDialogOpen()).toBeTruthy();

    timeoutBannerService.isVisible.set(false);
    fixture.detectChanges();
    expect(component.isDialogOpen()).toBeFalsy();
  });

  it('should start with dialog closed', () => {
    fixture.detectChanges();
    expect(component.isDialogOpen()).toBeFalsy();
  });

  it('should call extendSession when continue button clicked', () => {
    const spy = vi.spyOn(timeoutBannerService, 'extendSession');
    fixture.detectChanges();
    timeoutBannerService.isVisible.set(true);
    fixture.detectChanges();

    const continueBtn = fixture.nativeElement.querySelector('.govuk-button:not(.govuk-button--secondary)');
    continueBtn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should call signOut when sign out button clicked', () => {
    const spy = vi.spyOn(timeoutBannerService, 'signOut');
    fixture.detectChanges();
    timeoutBannerService.isVisible.set(true);
    fixture.detectChanges();

    const signOutBtn = fixture.nativeElement.querySelector('.govuk-button--secondary');
    signOutBtn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should show extend session message when timeExtensionAllowed is true', () => {
    fixture.detectChanges();
    const textDiv = fixture.nativeElement.querySelector('[aria-relevant="additions"][aria-hidden="true"]');
    expect(textDiv.innerHTML).toContain('if you do not respond');
  });

  it('should show no-extension message when timeExtensionAllowed is false', () => {
    timeoutBannerService.timeExtensionAllowed.set(false);
    fixture.detectChanges();
    const textDiv = fixture.nativeElement.querySelector('[aria-relevant="additions"][aria-hidden="true"]');
    expect(textDiv.innerHTML).toContain('automatically signed out');
  });

  it('should add overlay class when opening dialog', () => {
    fixture.detectChanges();
    timeoutBannerService.isVisible.set(true);
    fixture.detectChanges();
    expect(document.body.classList.contains('govuk-timeout-warning-overlay')).toBeTruthy();
  });

  it('should remove overlay class when closing dialog', () => {
    timeoutBannerService.isVisible.set(true);
    fixture.detectChanges();
    timeoutBannerService.isVisible.set(false);
    fixture.detectChanges();
    expect(document.body.classList.contains('govuk-timeout-warning-overlay')).toBeFalsy();
  });

  it('should manage focus on dialog open/close', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.govuk-button');
    button.focus();

    timeoutBannerService.isVisible.set(true);
    fixture.detectChanges();
    expect(document.activeElement?.getAttribute('role')).toBe('alertdialog');

    timeoutBannerService.isVisible.set(false);
    fixture.detectChanges();
    expect(document.activeElement).toBe(button);
  });
});
