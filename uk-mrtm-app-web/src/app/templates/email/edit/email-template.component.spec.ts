import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { NotificationTemplatesService } from '@mrtm/api';

import { ActivatedRouteStub, BasePage, mockClass } from '@netz/common/testing';

import { EmailTemplateComponent } from '@templates/email/edit/email-template.component';
import { mockedEmailTemplate } from '@templates/testing/templates-data.mock';

describe('EmailTemplateComponent', () => {
  let component: EmailTemplateComponent;
  let fixture: ComponentFixture<EmailTemplateComponent>;
  let page: Page;
  let activatedRoute: ActivatedRouteStub;

  const notificationTemplatesService = mockClass(NotificationTemplatesService);

  class Page extends BasePage<EmailTemplateComponent> {
    get title() {
      return this.query<HTMLDivElement>('.govuk-heading-l');
    }

    get templateSubjectValue() {
      return this.getInputValue('#subject');
    }

    set templateSubjectValue(value: string) {
      this.setInputValue('#subject', value);
    }

    get templateMessageValue() {
      return this.getInputValue('#message');
    }

    set templateMessageValue(value: string) {
      this.setInputValue('#message', value);
    }

    get errors() {
      return this.queryAll<HTMLAnchorElement>('.govuk-error-summary li a');
    }
  }

  beforeEach(async () => {
    activatedRoute = new ActivatedRouteStub(undefined, undefined, {
      emailTemplate: mockedEmailTemplate,
    });
    await TestBed.configureTestingModule({
      imports: [EmailTemplateComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: NotificationTemplatesService, useValue: notificationTemplatesService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailTemplateComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should succesfully submit changes in email content', () => {
    expect(page.title.textContent).toEqual(`Edit ${mockedEmailTemplate.name}`);
    expect(page.templateSubjectValue).toEqual(mockedEmailTemplate.subject);
    expect(page.templateMessageValue).toEqual(mockedEmailTemplate.text);

    page.templateSubjectValue = '';
    page.templateMessageValue = '';
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errors.map((error) => error.textContent.trim())).toEqual([
      'Enter an email subject',
      'Enter an email message',
    ]);

    const updatedSubject = 'Updated email template subject';
    const updatedMessage = 'Updated email template message';
    page.templateSubjectValue = updatedSubject;
    page.templateMessageValue = updatedMessage;

    notificationTemplatesService.updateNotificationTemplate.mockReturnValue(of(undefined));
    page.submitButton.click();
    fixture.detectChanges();
    expect(page.errorSummary).toBeFalsy();

    expect(notificationTemplatesService.updateNotificationTemplate).toHaveBeenCalledTimes(1);
    expect(notificationTemplatesService.updateNotificationTemplate).toHaveBeenCalledWith(mockedEmailTemplate.id, {
      subject: updatedSubject,
      text: updatedMessage,
    });
  });
});
