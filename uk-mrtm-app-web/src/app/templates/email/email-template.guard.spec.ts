import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { lastValueFrom, of } from 'rxjs';

import { NotificationTemplatesService } from '@mrtm/api';

import { ActivatedRouteSnapshotStub, mockClass, MockType } from '@netz/common/testing';

import { EmailTemplateGuard } from '@templates/email/email-template.guard';
import { mockedEmailTemplate } from '@templates/testing/templates-data.mock';

describe('EmailTemplateGuard', () => {
  let guard: EmailTemplateGuard;
  let notificationTemplatesService: MockType<NotificationTemplatesService>;

  beforeEach(() => {
    notificationTemplatesService = mockClass(NotificationTemplatesService);
    notificationTemplatesService.getNotificationTemplateById.mockReturnValueOnce(of(mockedEmailTemplate) as any);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        EmailTemplateGuard,
        { provide: NotificationTemplatesService, useValue: notificationTemplatesService },
      ],
    });
    guard = TestBed.inject(EmailTemplateGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return email template', async () => {
    await expect(
      lastValueFrom(guard.canActivate(new ActivatedRouteSnapshotStub({ templateId: mockedEmailTemplate.id }))),
    ).resolves.toBeTruthy();

    expect(notificationTemplatesService.getNotificationTemplateById).toHaveBeenCalledWith(mockedEmailTemplate.id);

    expect(guard.resolve()).toEqual(mockedEmailTemplate);
  });
});
