import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import { UsersService } from '@mrtm/api';

import { AuthService } from '@core/services/auth.service';
import { LatestTermsStore } from '@core/store/latest-terms/latest-terms.store';
import { LandingPageComponent } from '@landing-page/landing-page.component';
import { TermsAndConditionsComponent } from '@terms-and-conditions/terms-and-conditions.component';
import { Mocked } from 'vitest';

describe('TermsAndConditionsComponent', () => {
  let component: TermsAndConditionsComponent;
  let fixture: ComponentFixture<TestComponent>;
  let httpTestingController: HttpTestingController;
  let latestTermsStore: LatestTermsStore;
  const authService: Partial<Mocked<AuthService>> = {
    loadUserTerms: vi.fn(() => of({})),
  };

  @Component({
    selector: 'mrtm-test',
    imports: [TermsAndConditionsComponent],
    standalone: true,
    template: '<mrtm-terms-and-conditions />',
  })
  class TestComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: '',
            component: LandingPageComponent,
          },
        ]),
        UsersService,
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    latestTermsStore = TestBed.inject(LatestTermsStore);
    latestTermsStore.setLatestTerms({ url: '/test', version: 2 });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.debugElement.query(By.directive(TermsAndConditionsComponent)).componentInstance;
    fixture.detectChanges();
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have as title Accept terms and conditions', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toEqual('Terms and conditions');
  });

  it('should contain an accordion with 10 items', () => {
    const accordions = fixture.debugElement.queryAll(By.css('govuk-accordion'));
    expect(accordions.length).toEqual(1);
    expect(accordions[0].queryAll(By.css('govuk-accordion-item')).length).toEqual(10);
  });

  it('should enable button when checkbox is checked', () => {
    const compiled = fixture.debugElement.nativeElement;
    const checkbox = fixture.debugElement.queryAll(By.css('input'));
    checkbox[0].nativeElement.click();
    fixture.detectChanges();
    expect(compiled.querySelector('button').disabled).toBeFalsy();
  });

  it('should post if user accepts terms', inject([Router], (router: Router) => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const checkbox = fixture.debugElement.query(By.css('input[type=checkbox]'));
    const submitButton = fixture.debugElement.query(By.css('button[type=submit]'));

    submitButton.nativeElement.click();
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const errorSummary = compiled.querySelector('govuk-error-message').textContent.trim();
    expect(errorSummary).toEqual('Error: You should accept terms and conditions to proceed');

    checkbox.nativeElement.click();
    fixture.detectChanges();

    submitButton.nativeElement.click();
    fixture.detectChanges();

    const request = httpTestingController.expectOne('/api/v1.0/user-terms');
    expect(request.request.method).toEqual('PATCH');

    request.flush(200);
    expect(navigateSpy).toHaveBeenCalledWith(['']);
  }));
});
