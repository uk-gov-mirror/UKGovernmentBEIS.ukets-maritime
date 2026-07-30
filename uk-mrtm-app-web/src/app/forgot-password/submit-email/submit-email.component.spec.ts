import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { ForgotPasswordService } from '@mrtm/api';

import { BasePage } from '@netz/common/testing';

import { SubmitEmailComponent } from '@forgot-password/submit-email/submit-email.component';
import { BackToTopComponent } from '@shared/components';

describe('SubmitEmailComponent', () => {
  let component: SubmitEmailComponent;
  let fixture: ComponentFixture<SubmitEmailComponent>;
  let element: HTMLElement;
  let page: Page;

  @Component({
    selector: 'mrtm-email-sent',
    standalone: true,
    template: '<p>Mock template</p>',
  })
  class MockEmailSentComponent {
    readonly email = input<string>();
  }

  class Page extends BasePage<SubmitEmailComponent> {
    get inputError(): string[] {
      return this.queryAll<HTMLSpanElement>('.govuk-error-message').reduce(
        (result, element) => [
          ...result,
          ...Array.from(element.querySelectorAll('.govuk-\\!-display-block')).map((block) => block.textContent.trim()),
        ],
        [],
      );
    }

    getEmailSentComponent(): HTMLElement {
      return this.query('mrtm-email-sent');
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockEmailSentComponent, SubmitEmailComponent, BackToTopComponent],
      providers: [
        provideRouter([]),
        {
          provide: ForgotPasswordService,
          useValue: { sendResetPasswordEmail: vi.fn((email) => of(email)) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitEmailComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept valid email address', () => {
    const emailInput = fixture.debugElement.query(By.css('input'));
    const button = element.querySelector<HTMLButtonElement>('button');

    const setValueAndSubmit = (value) => {
      emailInput.triggerEventHandler('input', { target: { value } });
      button.click();
      fixture.detectChanges();
    };

    setValueAndSubmit('test');
    expect(page.inputError).toEqual(['Error: Enter an email address in the correct format, like name@example.com']);
    setValueAndSubmit('test@test.com');
    expect(page.getEmailSentComponent).toBeTruthy();
  });
});
